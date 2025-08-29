// Helper function to check if a date is within specified days from now
export const isWithinDays = (date: Date, days: number): boolean => {
  if (!date) return false;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

// Mock data generator
export const generateMockCases = (departmentId: number) => {
  const statuses = ['Pending', 'Resolved'];
  const today = new Date();
  
  return Array(15).fill(null).map((_, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const caseDate = new Date(today);
    caseDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
    const hearingDate = new Date(today);
    hearingDate.setDate(today.getDate() + Math.floor(Math.random() * 14));
    
    return {
      id: `CASE-${departmentId}-${index}`, // Ensure unique IDs
      date: caseDate,
      status,
      hearingDate: status === 'Pending' ? hearingDate : null,
      name: `Sample Case ${index + 1}`,
    };
  });
};

// Department data
export const departments = [
  { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
  { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
  { id: 3, name_en: "District Panchayat Department", name_hi: "जिला पंचायत विभाग" },
  { id: 4, name_en: "District Social Welfare Department", name_hi: "जिला समाज कल्याण विभाग" },
  { id: 5, name_en: "Animal Husbandry Department", name_hi: "पशुपालन विभाग" },
  { id: 6, name_en: "District Industries Department", name_hi: "जिला उद्योग विभाग" },
  { id: 7, name_en: "District Education Department", name_hi: "जिला शिक्षा विभाग" },
  { id: 8, name_en: "District Health Department", name_hi: "जिला स्वास्थ्य विभाग" },
  { id: 9, name_en: "District Agriculture Department", name_hi: "जिला कृषि विभाग" },
  { id: 10, name_en: "District Forest Department", name_hi: "जिला वन विभाग" },
  { id: 11, name_en: "District Program Department", name_hi: "जिला कार्यक्रम विभाग" },
  { id: 12, name_en: "District Food and Marketing Department", name_hi: "जिला खाद्य एवं विपणन विभाग" },
  { id: 13, name_en: "District Food Logistics Department", name_hi: "जिला खाद्य रसद विभाग" },
  { id: 14, name_en: "Agriculture Department", name_hi: "कृषि विभाग" },
  { id: 15, name_en: "Sugarcan Department", name_hi: "गन्ना विभाग" },
  { id: 16, name_en: "Agricultural Production Market Committee", name_hi: "कृषि उत्पादन मंडी समिति" },
  { id: 17, name_en: "labor department", name_hi: "श्रम विभाग" },
  { id: 18, name_en: "Excise Department", name_hi: "आबकारी विभाग" },
  { id: 19, name_en: "irrigation department", name_hi: "सिंचाई विभाग" },
  { id: 20, name_en: "Public Works Department, Provincial Division", name_hi: "लोक निर्माण विभाग, प्रान्तीय खण्ड" },
  { id: 21, name_en: "Public Works Department Construction Division-02", name_hi: "लोक निर्माण विभाग निर्माण खण्ड-02" },
  { id: 22, name_en: "Public Works Department Construction Division-03", name_hi: "लोक निर्माण विभाग निर्माण खण्ड-03" },
  { id: 23, name_en: "Public Works Department Division-04", name_hi: "लोक निर्माण विभाग खण्ड-04" },
  { id: 24, name_en: "Public Works Department NH (National Highway) Division", name_hi: "लोक निर्माण विभाग एन0एच0 खण्ड" },
  { id: 25, name_en: "Rural Engineering Department (R.E.D.)", name_hi: "ग्रामीण अभियंत्रण विभाग (आर०ई०डी०)" },
  { id: 26, name_en: "Saryu Canal Division", name_hi: "सरयू नहर खण्ड" },
  { id: 27, name_en: "Flood Works Division", name_hi: "बाढ़ कार्य खण्ड" },
  { id: 28, name_en: "Groundwater Department", name_hi: "भूगर्भ जल विभाग"},
  { id: 29, name_en: "Lift Irrigation Division", name_hi: "लिफ्ट सिंचाई खण्ड" },
  { id: 30, name_en: "Tubewell Construction Division", name_hi: "नलकूप निर्माण खण्ड" },
  { id: 31, name_en: "U.P. Jal Nigam Urban Construction Division", name_hi: "उ0 प्र0 जल निगम नगरीय निर्माण खण्ड" },
  { id: 32, name_en: "Minor Irrigation Division Ayodhya", name_hi: "लघु सिंचाई खण्ड अयोध्या" },
  { id: 33, name_en: "Electricity Department", name_hi: "विद्युत विभाग" },
  { id: 34, name_en: "ITI Department", name_hi: "आई0टी0आई0 विभाग" },
  { id: 35, name_en: "State Tax Department", name_hi: "राज्य कर विभाग" },
  { id: 36, name_en: "Police Department", name_hi: "पुलिस विभाग" },
  { id: 37, name_en: "Education Department", name_hi: "शिक्षा विभाग" },
  { id: 38, name_en: "Divisional Transport Department", name_hi: "सम्भागीय परिवहन विभाग " },
  { id: 39, name_en: "Uttar Pradesh State Road Transport Department", name_hi: "उ0 प्र0 राज्य सड़क परिवहन विभाग" },
  { id: 40, name_en: "Information Department", name_hi: "सूचना विभाग " },
  { id: 41, name_en: "Home Guards Department", name_hi: "होम गार्ड्स विभाग" },
  { id: 42, name_en: "Health Department", name_hi: "स्वास्थ्य विभाग" },
  { id: 43, name_en: "Stamp and Registration Department", name_hi: "स्टाम्प एवं रजिस्ट्रेशन विभाग" },
  { id: 44, name_en: "Ayodhya Development Authority Ayodhya", name_hi: "अयोध्या विकास प्राधिकरण अयोध्या" },
  { id: 45, name_en: "Public Works Department Electrical & Mechanical Section", name_hi: "लोक निर्माण विभाग विद्युत यांत्रिक खण्ड" },
  { id: 46, name_en: "Cooperative Department", name_hi: "सहकारिता विभाग" },
  { id: 47, name_en: "UPPCL U.P. Project Corporation Ltd. Construction Unit-11 Ayodhya", name_hi: "यूपीपीसीएल उ0 प्र0 प्रोजेक्ट कारपोरेशन लि0 निर्माण इकाई-11 अयोध्या।" },
  { id: 48, name_en: "Other Miscellaneous Departments", name_hi: "अन्य विविध विभाग" },
  { id: 49, name_en: "Nagar Nigam Ayodhya", name_hi: "नगर निगम अयोध्या" },
];

// Sub-departments for Administration Department
export const subDepartments = [
  { id: 101, name_en: "Chief Development Officer", name_hi: "मुख्य विकास अधिकारी" },
  { id: 102, name_en: "Additional District Magistrate (Finance / Revenue) Ayodhya", name_hi: "अपर जिलाधिकारी (वित्त / राजस्व) अयोध्या" },
  { id: 103, name_en: "Additional District Magistrate (City), Ayodhya", name_hi: "अपर जिलाधिकारी (नगर), अयोध्या" },
  { id: 104, name_en: "Additional District Magistrate (Administration)", name_hi: "अपर जिलाधिकारी (प्रशासन)" },
  { id: 105, name_en: "Chief Revenue Officer", name_hi: "मुख्य राजस्व अधिकारी" },
  { id: 106, name_en: "Additional District Magistrate (Law & Order)", name_hi: "अपर जिलाधिकारी (कानून एवं व्यवस्था)" },
  { id: 107, name_en: "Additional District Magistrate (Land Acquisition)", name_hi: "अपर जिलाधिकारी (भू-अर्जन)" },
  { id: 108, name_en: "City Magistrate", name_hi: "नगर मजिस्ट्रेट" },
  { id: 109, name_en: "Resident Magistrate", name_hi: "रेजीडेन्ट मजिस्ट्रेट" },
  { id: 110, name_en: "Deputy Divisional Consolidation", name_hi: "उप संभागीय चकबन्दी" },
  { id: 111, name_en: "Sub Divisional Magistrate Sadar", name_hi: "उप जिलाधिकारी सदर" },
  { id: 112, name_en: "Sub-District Magistrate, Bikapur", name_hi: "उप-जिला मजिस्ट्रेट, बिकापुर" },
  { id: 113, name_en: "Sub-District Magistrate, Rudauli", name_hi: "उप-जिला मजिस्ट्रेट, रुदौली" },
  { id: 114, name_en: "Sub-District Magistrate, Milkipur", name_hi: "उप-जिला मजिस्ट्रेट, मिल्कीपुर" },
  { id: 115, name_en: "Sub-District Magistrate, Sohawal", name_hi: "उप-जिला मजिस्ट्रेट, सोहावल" },
  { id: 116, name_en: "Assistant Record Officer", name_hi: "सहायक रिकॉर्ड अधिकारी" },
  { id: 117, name_en: "Tehsildar Sadar", name_hi: "तहसीलदार सदर" },
  { id: 118, name_en: "Tehsildar Bikapur", name_hi: "तहसीलदार बिकापुर" },
  { id: 119, name_en: "Tehsildar Rudauli", name_hi: "तहसीलदार रुदौली" },
  { id: 120, name_en: "Tehsildar Milkipur", name_hi: "तहसीलदार मिल्कीपुर" },
  { id: 121, name_en: "Tehsildar Sohawal", name_hi: "तहसीलदार सोहावल" },
  { id: 122, name_en: "Shri Raj Bahadur Verma, Nayab Tehsildar (Survey)", name_hi: "श्री राज बहादुर वर्मा, नायब तहसीलदार (सर्वेक्षण)" },
  { id: 123, name_en: "Shri Ravindra Nath Upadhyay, Nayab Tehsildar (Nazul)", name_hi: "श्री रविंद्र नाथ उपाध्याय, नायब तहसीलदार (नजूल)" }
];

// Language translations
export const translations = {
  en: {
    title: "Department Report",
    totalCases: "Total Cases",
    resolvedCases: "Resolved Cases",
    pendingCases: "Pending Cases",
    caseId: "Case ID",
    date: "Date",
    status: "Status",
    hearingDate: "Hearing Date",
    actions: "Actions",
    sendReminder: "Send Reminder",
    pending: "Pending",
    resolved: "Resolved",
    viewDetails: "View Details",
    addNewCase: "Add New Case",
    subDepartments: "Sub Departments",
    viewSubDepartment: "View",
    recentCases: "Recent Cases",
    writType: "Writ Type",
    contempt: "Contempt"
  },
  hi: {
    title: "विभागीय रिपोर्ट",
    totalCases: "कुल मामले",
    resolvedCases: "निराकृत मामले",
    pendingCases: "लंबित मामले",
    caseId: "मामला आईडी",
    date: "दिनांक",
    status: "स्थिति",
    hearingDate: "सुनवाई दिनांक",
    actions: "कार्यवाही",
    sendReminder: "भेजें अनुस्मारक",
    pending: "लंबित",
    resolved: "निराकृत",
    viewDetails: "विवरण देखें",
    addNewCase: "नया मामला जोड़ें",
    subDepartments: "उप विभाग",
    viewSubDepartment: "देखें",
    recentCases: "हाल के मामले",
    writType: "रीट प्रकार",
    contempt: "अवमानना"
  }
};

export interface CaseType {
  id: string;
  date: Date;
  status: 'Pending' | 'Resolved';
  hearingDate: Date | null;
  writType: string;
}

export interface TranslationType {
  caseId: string;
  date: string;
  status: string;
  hearingDate: string;
  actions: string;
  sendReminder: string;
  viewDetails: string;
  pending: string;
  resolved: string;
  writType: string;
  contempt: string;
}

// Firestore upload function
export const uploadDepartmentsToFirestore = async (departments: any[]) => {
  // This function is removed as per the instructions
};

// Function to fetch sub-departments from database and merge with static data
export const getSubDepartmentsForDepartment = async (departmentId: number) => {
  try {
    const response = await fetch(`https://jansunwayi-portal-ayodhya.onrender.com/sub-departments?departmentId=${departmentId}`);
    if (response.ok) {
      const dbSubDepts = await response.json();
      // Merge with static sub-departments (for department 1)
      if (departmentId === 1) {
        return [...subDepartments, ...dbSubDepts];
      }
      return dbSubDepts;
    }
  } catch (error) {
    console.error('Error fetching sub-departments:', error);
  }
  
  // Return static data as fallback
  return departmentId === 1 ? subDepartments : [];
};
