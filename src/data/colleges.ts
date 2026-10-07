export interface College {
  name: string;
  shortName?: string;
  city: string;
}

export const TAMILNADU_COLLEGES: College[] = [
  // Top / Host College
  { name: "Sona College of Technology, Salem", shortName: "Sona", city: "Salem" },
  { name: "Sona College of Arts and Science, Salem", shortName: "SCAS", city: "Salem" },

  // Premier Government & Autonomous Institutions
  { name: "College of Engineering, Guindy (CEG - Anna University), Chennai", shortName: "CEG", city: "Chennai" },
  { name: "Madras Institute of Technology (MIT - Anna University), Chromepet", shortName: "MIT Chennai", city: "Chennai" },
  { name: "PSG College of Technology, Coimbatore", shortName: "PSG Tech", city: "Coimbatore" },
  { name: "PSG Institute of Technology and Applied Research (PSG iTech), Coimbatore", shortName: "PSG iTech", city: "Coimbatore" },
  { name: "Thiagarajar College of Engineering (TCE), Madurai", shortName: "TCE", city: "Madurai" },
  { name: "Coimbatore Institute of Technology (CIT), Coimbatore", shortName: "CIT", city: "Coimbatore" },
  { name: "Government College of Technology (GCT), Coimbatore", shortName: "GCT", city: "Coimbatore" },
  { name: "Government College of Engineering (GCE), Salem", shortName: "GCE Salem", city: "Salem" },
  { name: "Government College of Engineering (GCE), Tirunelveli", shortName: "GCE Tirunelveli", city: "Tirunelveli" },
  { name: "Government College of Engineering (GCE), Bargur", shortName: "GCE Bargur", city: "Bargur" },
  { name: "Government College of Engineering (GCE), Thanjavur", shortName: "GCE Thanjavur", city: "Thanjavur" },
  { name: "Government College of Engineering (GCE), Bodinayakkanur", shortName: "GCE Bodi", city: "Bodinayakkanur" },
  { name: "Alagappa Chettiar Government College of Engineering and Technology (ACGCET), Karaikudi", shortName: "ACGCET", city: "Karaikudi" },

  // National Institutes in Tamil Nadu
  { name: "Indian Institute of Technology Madras (IIT Madras), Chennai", shortName: "IITM", city: "Chennai" },
  { name: "National Institute of Technology (NIT), Tiruchirappalli", shortName: "NITT", city: "Tiruchirappalli" },
  { name: "Indian Institute of Information Technology (IIIT), Srirangam, Trichy", shortName: "IIIT Trichy", city: "Tiruchirappalli" },

  // Prominent Autonomous & Affiliated Engineering Colleges
  { name: "Sri Sivasubramaniya Nadar (SSN) College of Engineering, Kalavakkam", shortName: "SSN", city: "Chennai" },
  { name: "Kumaraguru College of Technology (KCT), Coimbatore", shortName: "KCT", city: "Coimbatore" },
  { name: "Sri Krishna College of Engineering and Technology (SKCET), Coimbatore", shortName: "SKCET", city: "Coimbatore" },
  { name: "Sri Krishna College of Technology (SKCT), Coimbatore", shortName: "SKCT", city: "Coimbatore" },
  { name: "Bannari Amman Institute of Technology (BIT), Sathyamangalam", shortName: "BIT Sathy", city: "Erode" },
  { name: "Kongu Engineering College, Perundurai, Erode", shortName: "KEC", city: "Erode" },
  { name: "Mepco Schlenk Engineering College, Sivakasi", shortName: "Mepco", city: "Sivakasi" },
  { name: "National Engineering College, Kovilpatti", shortName: "NEC", city: "Kovilpatti" },
  { name: "K.S. Rangasamy College of Technology (KSRCT), Tiruchengode", shortName: "KSRCT", city: "Tiruchengode" },
  { name: "KSR Institute for Engineering and Technology, Tiruchengode", shortName: "KSRIET", city: "Tiruchengode" },
  { name: "Muthayammal Engineering College, Rasipuram", shortName: "MEC Rasipuram", city: "Rasipuram" },
  { name: "Paavai Engineering College, Pachal, Namakkal", shortName: "Paavai", city: "Namakkal" },
  { name: "Mahendra Engineering College, Mallasamudram", shortName: "Mahendra", city: "Namakkal" },
  { name: "Knowledge Institute of Technology (KIOT), Salem", shortName: "KIOT", city: "Salem" },
  { name: "AVS Engineering College, Salem", shortName: "AVS", city: "Salem" },
  { name: "Vinayaka Mission's Kirupananda Variyar Engineering College, Salem", shortName: "VMKVEC", city: "Salem" },
  { name: "Salem Sowdeswari College, Salem", shortName: "SSC", city: "Salem" },
  { name: "Periyar University, Salem", shortName: "Periyar Univ", city: "Salem" },

  // Chennai & Kanchipuram Region
  { name: "St. Joseph's College of Engineering, Chennai", shortName: "St. Joseph's", city: "Chennai" },
  { name: "St. Joseph's Institute of Technology, Chennai", shortName: "St. Joseph's Tech", city: "Chennai" },
  { name: "Rajalakshmi Engineering College (REC), Thandalam, Chennai", shortName: "REC Chennai", city: "Chennai" },
  { name: "Rajalakshmi Institute of Technology (RIT), Chennai", shortName: "RIT Chennai", city: "Chennai" },
  { name: "Sri Venkateswara College of Engineering (SVCE), Sriperumbudur", shortName: "SVCE", city: "Chennai" },
  { name: "R.M.K. Engineering College, Gummidipoondi", shortName: "RMK", city: "Chennai" },
  { name: "R.M.D. Engineering College, Kavaraipettai", shortName: "RMD", city: "Chennai" },
  { name: "Velammal Engineering College, Surapet, Chennai", shortName: "Velammal Chennai", city: "Chennai" },
  { name: "Meenakshi Sundararajan Engineering College, Kodambakkam, Chennai", shortName: "MSEC", city: "Chennai" },
  { name: "Easwari Engineering College, Ramapuram, Chennai", shortName: "Easwari", city: "Chennai" },
  { name: "Panimalar Engineering College, Poonamallee, Chennai", shortName: "Panimalar", city: "Chennai" },
  { name: "Saveetha Engineering College, Thandalam, Chennai", shortName: "Saveetha", city: "Chennai" },
  { name: "Loyola-ICAM College of Engineering and Technology (LICET), Chennai", shortName: "LICET", city: "Chennai" },
  { name: "Sri Sai Ram Engineering College, West Tambaram, Chennai", shortName: "Sairam Engg", city: "Chennai" },
  { name: "Sri Sairam Institute of Technology, Chennai", shortName: "Sairam Tech", city: "Chennai" },
  { name: "Jerusalem College of Engineering, Pallikaranai, Chennai", shortName: "Jerusalem", city: "Chennai" },
  { name: "Anand Institute of Higher Technology, Kazhipattur, Chennai", shortName: "AIHT", city: "Chennai" },
  { name: "Prathyusha Engineering College, Thiruvallur", shortName: "PEC", city: "Thiruvallur" },
  { name: "DMI College of Engineering, Palanchur, Chennai", shortName: "DMI", city: "Chennai" },
  { name: "Tagore Engineering College, Vandalur, Chennai", shortName: "Tagore", city: "Chennai" },
  { name: "KCG College of Technology, Karapakkam, Chennai", shortName: "KCG", city: "Chennai" },

  // Deemed Universities in TN
  { name: "Vellore Institute of Technology (VIT), Vellore", shortName: "VIT Vellore", city: "Vellore" },
  { name: "Vellore Institute of Technology (VIT), Chennai", shortName: "VIT Chennai", city: "Chennai" },
  { name: "SRM Institute of Science and Technology, Kattankulathur", shortName: "SRM KTR", city: "Chengalpattu" },
  { name: "SRM Institute of Science and Technology, Ramapuram", shortName: "SRM Ramapuram", city: "Chennai" },
  { name: "SASTRA Deemed University, Thanjavur", shortName: "SASTRA", city: "Thanjavur" },
  { name: "Amrita Vishwa Vidyapeetham, Coimbatore", shortName: "Amrita", city: "Coimbatore" },
  { name: "Sathyabama Institute of Science and Technology, Chennai", shortName: "Sathyabama", city: "Chennai" },
  { name: "Hindustan Institute of Technology and Science (HITS), Padur", shortName: "Hindustan Univ", city: "Chennai" },
  { name: "B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur", shortName: "Crescent", city: "Chennai" },
  { name: "Kalasalingam Academy of Research and Education (KARE), Krishnankoil", shortName: "Kalasalingam", city: "Virudhunagar" },

  // Coimbatore & Western TN Region
  { name: "Sri Ramakrishna Engineering College (SREC), Coimbatore", shortName: "SREC", city: "Coimbatore" },
  { name: "Sri Ramakrishna Institute of Technology (SRIT), Coimbatore", shortName: "SRIT", city: "Coimbatore" },
  { name: "Hindusthan College of Engineering and Technology (HICET), Coimbatore", shortName: "HICET", city: "Coimbatore" },
  { name: "Dr. Mahalingam College of Engineering and Technology (MCET), Pollachi", shortName: "MCET Pollachi", city: "Pollachi" },
  { name: "Karpagam College of Engineering, Coimbatore", shortName: "Karpagam Engg", city: "Coimbatore" },
  { name: "Karpagam Academy of Higher Education, Coimbatore", shortName: "KAHE", city: "Coimbatore" },
  { name: "KPR Institute of Engineering and Technology, Arasur, Coimbatore", shortName: "KPRIET", city: "Coimbatore" },
  { name: "SNS College of Technology, Coimbatore", shortName: "SNS Tech", city: "Coimbatore" },
  { name: "SNS College of Engineering, Coimbatore", shortName: "SNS Engg", city: "Coimbatore" },
  { name: "Dr. N.G.P. Institute of Technology, Coimbatore", shortName: "Dr NGP IT", city: "Coimbatore" },
  { name: "Kalaignar Karunanidhi Institute of Technology (KIT), Coimbatore", shortName: "KIT Coimbatore", city: "Coimbatore" },
  { name: "Nehru Institute of Engineering and Technology, Coimbatore", shortName: "NIET", city: "Coimbatore" },
  { name: "PPG Institute of Technology, Coimbatore", shortName: "PPG", city: "Coimbatore" },
  { name: "Erode Sengunthar Engineering College, Thuduppathi, Erode", shortName: "ESEC", city: "Erode" },
  { name: "Velalar College of Engineering and Technology, Thindal, Erode", shortName: "VCET Erode", city: "Erode" },
  { name: "Nandha Engineering College, Erode", shortName: "Nandha Engg", city: "Erode" },
  { name: "Nandha College of Technology, Erode", shortName: "Nandha Tech", city: "Erode" },
  { name: "Sasurie College of Engineering, Vijayamangalam", shortName: "Sasurie", city: "Tiruppur" },
  { name: "Adhiyamaan College of Engineering, Hosur", shortName: "Adhiyamaan", city: "Hosur" },
  { name: "Government College of Engineering, Dharmapuri", shortName: "GCE Dharmapuri", city: "Dharmapuri" },
  { name: "Jayalakshmi Institute of Technology, Thoppur, Dharmapuri", shortName: "JIT Dharmapuri", city: "Dharmapuri" },

  // Trichy, Thanjavur & Central TN Region
  { name: "Saranathan College of Engineering, Panjappur, Tiruchirappalli", shortName: "Saranathan", city: "Tiruchirappalli" },
  { name: "K. Ramakrishnan College of Engineering, Samayapuram, Trichy", shortName: "KRCE", city: "Tiruchirappalli" },
  { name: "K. Ramakrishnan College of Technology, Samayapuram, Trichy", shortName: "KRCT", city: "Tiruchirappalli" },
  { name: "M.A.M. College of Engineering, Siruganur, Trichy", shortName: "MAMCE", city: "Tiruchirappalli" },
  { name: "M.A.M. College of Engineering and Technology, Trichy", shortName: "MAMCET", city: "Tiruchirappalli" },
  { name: "J.J. College of Engineering and Technology, Ammapettai, Trichy", shortName: "JJCET", city: "Tiruchirappalli" },
  { name: "Care College of Engineering, Samayapuram, Trichy", shortName: "CARE", city: "Tiruchirappalli" },
  { name: "Oxford Engineering College, Pirattiyur, Trichy", shortName: "Oxford Trichy", city: "Tiruchirappalli" },
  { name: "Dhanalakshmi Srinivasan Engineering College, Perambalur", shortName: "DSEC Perambalur", city: "Perambalur" },
  { name: "Srinivasan Engineering College, Perambalur", shortName: "SEC Perambalur", city: "Perambalur" },
  { name: "Roever Engineering College, Perambalur", shortName: "Roever", city: "Perambalur" },
  { name: "Anjalai Ammal Mahalingam Engineering College (AAMEC), Kovilvenni", shortName: "AAMEC", city: "Thiruvarur" },
  { name: "Periyar Maniammai Institute of Science and Technology, Vallam, Thanjavur", shortName: "PMIST", city: "Thanjavur" },
  { name: "Kings College of Engineering, Punalkulam, Pudukkottai", shortName: "Kings", city: "Pudukkottai" },
  { name: "Mount Zion College of Engineering and Technology, Pudukkottai", shortName: "Mount Zion", city: "Pudukkottai" },
  { name: "Chendhuran College of Engineering and Technology, Pudukkottai", shortName: "Chendhuran", city: "Pudukkottai" },

  // Madurai & Southern TN Region
  { name: "Velammal College of Engineering and Technology, Madurai", shortName: "VCET Madurai", city: "Madurai" },
  { name: "K.L.N. College of Engineering, Pottapalayam, Sivagangai", shortName: "KLNCE", city: "Madurai" },
  { name: "K.L.N. College of Information Technology, Madurai", shortName: "KLNCIT", city: "Madurai" },
  { name: "Sethu Institute of Technology, Kariapatti, Virudhunagar", shortName: "Sethu Tech", city: "Virudhunagar" },
  { name: "Kamaraj College of Engineering and Technology, Virudhunagar", shortName: "Kamaraj Engg", city: "Virudhunagar" },
  { name: "AAA College of Engineering and Technology, Amathur, Sivakasi", shortName: "AAA CET", city: "Sivakasi" },
  { name: "Ramco Institute of Technology, Rajapalayam", shortName: "RIT Rajapalayam", city: "Rajapalayam" },
  { name: "PSNA College of Engineering and Technology, Dindigul", shortName: "PSNA", city: "Dindigul" },
  { name: "SSM Institute of Engineering and Technology, Dindigul", shortName: "SSMIET", city: "Dindigul" },
  { name: "Francis Xavier Engineering College, Vannarpettai, Tirunelveli", shortName: "FXEC", city: "Tirunelveli" },
  { name: "National College of Engineering, Maruthakulam, Tirunelveli", shortName: "NCE Tirunelveli", city: "Tirunelveli" },
  { name: "SCAD College of Engineering and Technology, Cheranmahadevi", shortName: "SCAD", city: "Tirunelveli" },
  { name: "St. Xavier's Catholic College of Engineering, Chunkankadai, Nagercoil", shortName: "SXCCE", city: "Nagercoil" },
  { name: "Noorul Islam Centre for Higher Education, Kumaracoil, Kanyakumari", shortName: "NICHE", city: "Kanyakumari" },
  { name: "Loyola Institute of Technology and Science, Thovalai, Kanyakumari", shortName: "LITES", city: "Kanyakumari" },

  // University Regional Campuses
  { name: "Anna University Regional Campus, Coimbatore", shortName: "AURC CBE", city: "Coimbatore" },
  { name: "Anna University Regional Campus, Madurai", shortName: "AURC Madurai", city: "Madurai" },
  { name: "Anna University Regional Campus, Tiruchirappalli", shortName: "AURC Trichy", city: "Tiruchirappalli" },
  { name: "Anna University Regional Campus, Tirunelveli", shortName: "AURC TVL", city: "Tirunelveli" },

  // Arts, Science & Autonomous Colleges
  { name: "Loyola College (Autonomous), Chennai", shortName: "Loyola Arts", city: "Chennai" },
  { name: "Madras Christian College (MCC), Tambaram, Chennai", shortName: "MCC", city: "Chennai" },
  { name: "Presidency College (Autonomous), Chennai", shortName: "Presidency", city: "Chennai" },
  { name: "PSG College of Arts and Science, Coimbatore", shortName: "PSG Arts", city: "Coimbatore" },
  { name: "Bishop Heber College, Tiruchirappalli", shortName: "Bishop Heber", city: "Tiruchirappalli" },
  { name: "St. Joseph's College (Autonomous), Tiruchirappalli", shortName: "St Joseph Trichy", city: "Tiruchirappalli" },
  { name: "The American College, Madurai", shortName: "American College", city: "Madurai" },
  { name: "Thiagarajar College (Arts & Science), Madurai", shortName: "TC Madurai", city: "Madurai" },
  { name: "St. Xavier's College (Autonomous), Palayamkottai", shortName: "St Xavier Palayamkottai", city: "Palayamkottai" },
  { name: "Ayya Nadar Janaki Ammal College, Sivakasi", shortName: "ANJAC", city: "Sivakasi" },

  // General Other options
  { name: "Other Engineering College in Tamil Nadu", shortName: "Other TN Engg", city: "Tamil Nadu" },
  { name: "Other Arts & Science College in Tamil Nadu", shortName: "Other TN Arts", city: "Tamil Nadu" },
  { name: "Other State College / University", shortName: "Other State", city: "Other" }
];

export const COLLEGE_SELECT_OPTIONS = TAMILNADU_COLLEGES.map(c => ({
  value: c.name,
  label: c.name,
  description: `${c.city}${c.shortName ? ` • ${c.shortName}` : ""}`,
}));
