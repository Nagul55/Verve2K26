-- Migration: Atomic Capacity Check & Reservation Function with FOR UPDATE Row Locking
CREATE OR REPLACE FUNCTION check_and_reserve_sub_events_capacity(
  p_sub_event_ids UUID[],
  p_requested_seats INT[]
) RETURNS JSONB AS $$
DECLARE
  v_i INT;
  v_sub_event_id UUID;
  v_req_seats INT;
  v_capacity INT;
  v_occupied INT;
  v_title TEXT;
BEGIN
  IF array_length(p_sub_event_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  FOR v_i IN 1..array_length(p_sub_event_ids, 1) LOOP
    v_sub_event_id := p_sub_event_ids[v_i];
    v_req_seats := p_requested_seats[v_i];

    -- Exclusive row lock on sub_event to prevent concurrent race conditions
    SELECT capacity, title INTO v_capacity, v_title
    FROM sub_events
    WHERE id = v_sub_event_id
    FOR UPDATE;

    IF v_capacity IS NOT NULL AND v_capacity > 0 THEN
      SELECT COUNT(*)::INT INTO v_occupied
      FROM registration_sub_events
      WHERE sub_event_id = v_sub_event_id;

      IF (v_occupied + v_req_seats) > v_capacity THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'EVENT_FULL',
          'message', format('Registration closed for "%s". Only %s seat(s) remaining (Capacity: %s).', v_title, GREATEST(0, v_capacity - v_occupied), v_capacity)
        );
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
