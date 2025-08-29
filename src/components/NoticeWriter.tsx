"use client"
import { useState, useEffect } from "react"

// Types
interface Department {
  id: number
  name_en: string
  name_hi: string
}

interface SubDepartment {
  _id: string
  departmentId: number
  name_en: string
  name_hi: string
}

interface Case {
  _id: string
  caseNumber: string
  petitionerName: string
  respondentName: string
  filingDate: string
  petitionNumber?: string
  noticeNumber?: string
  writType?: string
  department: number
  subDepartment?: SubDepartment
  status: string
  hearingDate?: string
}

interface NoticeData {
  noticeType: "regular" | "contempt" | "custom"
  language: "en" | "hi"
  department?: Department
  subDepartment?: SubDepartment
  caseData?: Case
  customContent?: string
  date: string
  letterNumber: string
  subject: string
  content: string
  signatory: string
  designation: string
}

interface NoticeWriterProps {
  caseId?: string;
}

const API_BASE = "https://jansunwayi-portal-ayodhya.onrender.com/"

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-content, #printable-content * {
      visibility: visible;
    }
    #printable-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      display: block !important;
    }
    .no-print {
      display: none !important;
    }
  }
`

export default function CourtNoticeWriter({ caseId }: NoticeWriterProps) {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<"en" | "hi">("hi")
  const [departments, setDepartments] = useState<Department[]>([])
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)

  // Email related states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  const [noticeData, setNoticeData] = useState<NoticeData>({
    noticeType: "regular",
    language: "hi",
    date: new Date().toLocaleDateString("en-GB"),
    letterNumber: "",
    subject: "",
    content: "",
    signatory: "",
    designation: "",
  })

  const handlePrint = () => {
    window.print()
  }

  // Email functionality
  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      setEmailStatus({
        type: "error",
        message: language === "hi" ? "कृपया ईमेल पता दर्ज करें" : "Please enter email address",
      })
      return
    }

    if (!recipientEmail.includes("@")) {
      setEmailStatus({
        type: "error",
        message: language === "hi" ? "कृपया वैध ईमेल पता दर्ज करें" : "Please enter a valid email address",
      })
      return
    }

    setEmailSending(true)
    setEmailStatus({ type: null, message: "" })

    try {
      // Generate HTML content for email
      const emailHtml = generateEmailHTML()

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `${language === "hi" ? "न्यायालयी नोटिस" : "Court Notice"} - ${noticeData.subject}`,
          html: emailHtml,
          noticeData: noticeData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setEmailStatus({
          type: "success",
          message: language === "hi" ? "ईमेल सफलतापूर्वक भेजा गया" : "Email sent successfully",
        })
        setTimeout(() => {
          setShowEmailModal(false)
          setRecipientEmail("")
          setEmailStatus({ type: null, message: "" })
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      setEmailStatus({
        type: "error",
        message: language === "hi" ? "ईमेल भेजने में त्रुटि हुई" : "Error sending email",
      })
    } finally {
      setEmailSending(false)
    }
  }

  const generateEmailHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Court Notice</title>
        <style>
          body {
            font-family: ${language === "hi" ? "'Noto Sans Devanagari', Arial, sans-serif" : "'Times New Roman', serif"};
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .urgent {
            color: red;
            font-weight: bold;
            font-size: 14px;
          }
          .date-letter {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .subject {
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 40px;
            text-align: justify;
            white-space: pre-line;
          }
          .copy-to {
            margin-bottom: 20px;
          }
          .signature {
            text-align: right;
            margin-top: 60px;
          }
          .signature-space {
            margin-bottom: 60px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${language === "hi" ? "कार्यालय जिलाधिकारी, अयोध्या" : "Office of District Magistrate, Ayodhya"}</h1>
          ${noticeData.noticeType === "contempt" ? `<div class="urgent">${language === "hi" ? "अति आवश्यक / सर्वोच्च प्राथमिकता" : "Most Urgent / Highest Priority"}</div>` : ""}
        </div>
        
        <div class="date-letter">
          <div>${language === "hi" ? "दिनांक:" : "Date:"} ${noticeData.date}</div>
          <div>${language === "hi" ? "पत्रांक:" : "Letter No:"} ${noticeData.letterNumber}</div>
        </div>
        
        <div class="subject">
          <strong>${language === "hi" ? "विषय-" : "Subject-"}</strong> ${noticeData.subject}
        </div>
        
        ${
          noticeData.department
            ? `
        <div style="margin-bottom: 20px;">
          <div>${language === "hi" ? noticeData.department.name_hi : noticeData.department.name_en}</div>
          ${noticeData.subDepartment ? `<div>${language === "hi" ? noticeData.subDepartment.name_hi : noticeData.subDepartment.name_en}</div>` : ""}
        </div>
        `
            : ""
        }
        
        <div class="content">${noticeData.content}</div>
        
        <div class="copy-to">
          <div>${language === "hi" ? "संख्या व दिनांक उपरोक्त।" : "Number and date as above."}</div>
          <div>${language === "hi" ? "प्रतिलिपि-जिलाधिकारी, महोदय को सादर अवलोकनार्थ।" : "Copy to- District Magistrate, Sir for kind perusal."}</div>
        </div>
        
        <div class="signature">
          <div class="signature-space">${language === "hi" ? "हस्ताक्षर" : "Signature"}</div>
          <div>(${noticeData.signatory})</div>
          <div>${noticeData.designation}</div>
          <div>${language === "hi" ? "अयोध्या।" : "Ayodhya."}</div>
        </div>
      </body>
      </html>
    `
  }

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch case data if caseId is provided
        if (caseId) {
          console.log('Fetching case data for ID:', caseId);
          const response = await fetch(`${API_BASE}/cases/${caseId}`);
          if (!response.ok) {
            throw new Error(`Error fetching case: ${response.statusText}`);
          }
          const caseData = await response.json();
          console.log('Case data received:', caseData);
          
          // Fetch departments and automatically select the case's department
          const deptsResponse = await fetch(`${API_BASE}/departments`);
          if (!deptsResponse.ok) {
            throw new Error(`Error fetching departments: ${deptsResponse.statusText}`);
          }
          const departmentsData = await deptsResponse.json();
          setDepartments(departmentsData);
          
          // Find and set the case's department
          const caseDepartment = departmentsData.find((d: Department) => d.id === caseData.department);
          if (caseDepartment) {
            setNoticeData(prev => ({
              ...prev,
              department: caseDepartment,
              caseData: caseData
            }));
            
            // Fetch and set subdepartments
            const subDeptsResponse = await fetch(`${API_BASE}/sub-departments?department=${caseDepartment.id}`);
            if (!subDeptsResponse.ok) {
              throw new Error(`Error fetching sub-departments: ${subDeptsResponse.statusText}`);
            }
            const subDepartmentsData = await subDeptsResponse.json();
            setSubDepartments(subDepartmentsData);
            
            // Find and set the case's subdepartment
            const caseSubDepartment = subDepartmentsData.find((sd: SubDepartment) => 
              caseData.subDepartments?.includes(sd._id)
            );
            if (caseSubDepartment) {
              handleSubDepartmentSelect(caseSubDepartment);
            }
          }
        } else {
          // If no caseId, just fetch departments
          await fetchDepartments();
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [caseId])

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/departments`)
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchSubDepartments = async (departmentId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/sub-departments?departmentId=${departmentId}`)
      const data = await response.json()
      setSubDepartments(data)
    } catch (error) {
      console.error("Error fetching sub-departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCases = async (departmentId: number, subDepartmentId?: string) => {
    try {
      setLoading(true)
      let url = `${API_BASE}/cases?department=${departmentId}`
      if (subDepartmentId) {
        url += `&subDepartment=${subDepartmentId}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setCases(data.cases || [])
    } catch (error) {
      console.error("Error fetching cases:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateRegularNoticeContent = (caseData: Case, dept: Department, subDept?: SubDepartment) => {
    if (language === "hi") {
      return {
        subject: `रिट याचिका संख्या ${caseData.caseNumber} के संबंध में`,
        content: `कृपया उपर्युक्त विषयक का संदर्भ लें। उपरोक्त रिट याचिका के संबंध में मा० उच्च न्यायालय द्वारा निर्देशित कार्यवाही हेतु निम्नलिखित जानकारी प्रेषित की जा रही है:

1. याचिकाकर्ता का नाम: ${caseData.petitionerName}
2. प्रतिवादी का नाम: ${caseData.respondentName}
3. रिट याचिका संख्या: ${caseData.caseNumber}
4. दाखिल दिनांक: ${new Date(caseData.filingDate).toLocaleDateString("hi-IN")}
5. विभाग: ${dept.name_hi}${
          subDept
            ? `
6. उप-विभाग: ${subDept.name_hi}`
            : ""
        }

उपरोक्त मामले में आवश्यक कार्यवाही करने तथा प्रतिवेदन प्रेषित करने का कष्ट करें।

कृपया इस मामले में तत्परता से आवश्यक कार्यवाही सुनिश्चित करें तथा अनुपालना रिपोर्ट इस कार्यालय को प्रेषित करने का कष्ट करें।`,
      }
    } else {
      return {
        subject: `Regarding Writ Petition No. ${caseData.caseNumber}`,
        content: `Please refer to the above subject. The following information is being sent for the action directed by the Hon'ble High Court regarding the above writ petition:

1. Petitioner's Name: ${caseData.petitionerName}
2. Respondent's Name: ${caseData.respondentName}
3. Writ Petition Number: ${caseData.caseNumber}
4. Filing Date: ${new Date(caseData.filingDate).toLocaleDateString("en-GB")}
5. Department: ${dept.name_en}${
          subDept
            ? `
6. Sub-Department: ${subDept.name_en}`
            : ""
        }

Please take necessary action in the above matter and send the report.

Please ensure prompt necessary action in this matter and send the compliance report to this office.`,
      }
    }
  }

  const generateContemptNoticeContent = (caseData: Case, dept: Department, subDept?: SubDepartment) => {
    if (language === "hi") {
      return {
        subject: `अवमानना आवेदन संख्या ${caseData.caseNumber} में वांछित आवश्यक कार्यवाही किये जाने के सम्बन्ध में`,
        content: `कृपया उपर्युक्त विषयक का सन्दर्भ ग्रहण करने का कष्ट करें। जिसके द्वारा अवमानना आवेदन संख्या ${caseData.caseNumber}, याचिकाकर्ता: ${caseData.petitionername}, प्रतिवादी: ${caseData.respondentname} से सम्बंधित है। प्रश्नगत अवमानना वाद में प्रभावी पैरवी/सम्पूर्ण विधिक कार्यवाही निर्धारित सीमा के भीतर पूर्ण कराने की अपेक्षा की गयी है।

अतः वाद सम्बंधित अवमानना वाद में तत्परता प्रभावी पैरवी / सम्पूर्ण विधिक कार्यवाही निर्धारित सीमा के भीतर सुनिश्चित करायें। प्रश्नगत अवमानना वाद में ${caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString("hi-IN") : "अगली तारीख"} की तिथि नियत है।

यदि कोई अनिश्चित स्थिति उत्पन्न होती है तो आप स्वयं जिम्मेदार होंगे, तथा कृत कार्यवाही से जिलाधिकारी महोदय को अवगत कराने का कष्ट करें।`,
      }
    } else {
      return {
        subject: `Regarding necessary action required in Contempt Application No. ${caseData.caseNumber}`,
        content: `Please refer to the above subject matter relating to Contempt Application No. ${caseData.caseNumber}, Petitioner: ${caseData.petitionerName}, Respondent: ${caseData.respondentName}.

Effective advocacy/complete legal proceedings are expected to be completed within the prescribed limit in the contempt case in question.

Therefore, ensure prompt effective advocacy/complete legal proceedings within the prescribed limit in this contempt case. The date ${caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString("en-GB") : "next hearing"} is fixed in the contempt case in question.

If any uncertain situation arises, you will be responsible yourself, and please inform the District Magistrate about the action taken.`,
      }
    }
  }

  const handleNoticeTypeSelect = (type: "regular" | "contempt" | "custom") => {
    setNoticeData((prev) => ({ ...prev, noticeType: type }))
    if (type === "custom") {
      setStep(6) // Skip to custom content step
    } else {
      setStep(2)
    }
  }

  const handleDepartmentSelect = (dept: Department) => {
    setNoticeData((prev) => ({ ...prev, department: dept }))
    fetchSubDepartments(dept.id)
    setStep(3)
  }

  const handleSubDepartmentSelect = (subDept: SubDepartment) => {
    setNoticeData((prev) => ({ ...prev, subDepartment: subDept }))
    fetchCases(noticeData.department!.id, subDept._id)
    setStep(4)
  }

  const handleCaseSelect = (caseData: Case) => {
    const generatedContent =
      noticeData.noticeType === "regular"
        ? generateRegularNoticeContent(caseData, noticeData.department!, noticeData.subDepartment)
        : generateContemptNoticeContent(caseData, noticeData.department!, noticeData.subDepartment)

    setNoticeData((prev) => ({
      ...prev,
      caseData,
      subject: generatedContent.subject,
      content: generatedContent.content,
      letterNumber: `${Math.floor(Math.random() * 9000) + 1000}/${noticeData.noticeType === "contempt" ? "अवमानना" : "रिट"}/${new Date().getFullYear()}`,
      signatory: language === "hi" ? "अपर जिलाधिकारी" : "Additional District Magistrate",
      designation: language === "hi" ? "(वि०/न्या०)/प्रभारी अधिकारी रिट" : "(Legal)/In-charge Officer Writ",
    }))
    setStep(5)
  }

  const resetForm = () => {
    setStep(1)
    setNoticeData({
      noticeType: "regular",
      language: "hi",
      date: new Date().toLocaleDateString("en-GB"),
      letterNumber: "",
      subject: "",
      content: "",
      signatory: "",
      designation: "",
    })
    setSubDepartments([])
    setCases([])
  }

  // Email Modal Component
  const EmailModal = () => {
    if (!showEmailModal) return null

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}
        className="no-print"
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              fontSize: "1.4rem",
              fontWeight: "600",
              textAlign: "center",
              color: "black",
            }}
          >
            {language === "hi" ? "ईमेल भेजें" : "Send Email"}
          </h3>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "black",
                fontSize: "1rem",
              }}
            >
              {language === "hi" ? "प्राप्तकर्ता का ईमेल:" : "Recipient Email:"}
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              autoFocus
              placeholder={language === "hi" ? "ईमेल पता दर्ज करें" : "Enter email address"}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "1rem",
                transition: "border-color 0.2s ease",
                outline: "none",
                color: "black",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {emailStatus.message && (
            <div
              style={{
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "20px",
                backgroundColor: emailStatus.type === "success" ? "#d1fae5" : "#fee2e2",
                color: emailStatus.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${emailStatus.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {emailStatus.message}
            </div>
          )}

          <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <button
              onClick={handleSendEmail}
              disabled={emailSending}
              style={{
                padding: "12px 30px",
                backgroundColor: emailSending ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: emailSending ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
            >
              {emailSending
                ? language === "hi"
                  ? "भेजा जा रहा है..."
                  : "Sending..."
                : language === "hi"
                  ? "भेजें"
                  : "Send"}
            </button>
            <button
              onClick={() => {
                setShowEmailModal(false)
                setRecipientEmail("")
                setEmailStatus({ type: null, message: "" })
              }}
              disabled={emailSending}
              style={{
                padding: "12px 30px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: emailSending ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div
            style={{
              padding: "40px",
              maxWidth: "700px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "25px",
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  textAlign: "center",
                  color: "black",
                }}
              >
                {language === "hi" ? "नोटिस का प्रकार चुनें:" : "Select Notice Type:"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <button
                  onClick={() => handleNoticeTypeSelect("regular")}
                  style={{
                    padding: "20px 30px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }}
                >
                  {language === "hi" ? "नियमित नोटिस" : "Regular Notice"}
                </button>
                <button
                  onClick={() => handleNoticeTypeSelect("contempt")}
                  style={{
                    padding: "20px 30px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }}
                >
                  {language === "hi" ? "अवमानना नोटिस" : "Contempt Notice"}
                </button>
                <button
                  onClick={() => handleNoticeTypeSelect("custom")}
                  style={{
                    padding: "20px 30px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }}
                >
                  {language === "hi" ? "कस्टम नोटिस" : "Custom Notice"}
                </button>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div
            style={{
              padding: "30px",
              maxWidth: "800px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "black",
                marginBottom: "30px",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {language === "hi" ? "विभाग चुनें" : "Select Department"}
            </h2>
            <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept)}
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    border: "2px solid #3b82f6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    color: "black",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                    e.currentTarget.style.color = "white"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white"
                    e.currentTarget.style.color = "black"
                  }}
                >
                  {language === "hi" ? dept.name_hi : dept.name_en}
                </button>
              ))}
            </div>
            <button
              onClick={resetForm}
              style={{
                marginTop: "30px",
                padding: "12px 30px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )
      case 3:
        return (
          <div
            style={{
              padding: "30px",
              maxWidth: "800px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "black",
                marginBottom: "30px",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {language === "hi" ? "उप-विभाग चुनें" : "Select Sub-Department"}
            </h2>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "black",
                  fontSize: "1.2rem",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "20px",
                  }}
                ></div>
                <div>{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
                {subDepartments.map((subDept) => (
                  <button
                    key={subDept._id}
                    onClick={() => handleSubDepartmentSelect(subDept)}
                    style={{
                      padding: "20px",
                      backgroundColor: "white",
                      border: "2px solid #3b82f6",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      color: "black",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#3b82f6"
                      e.currentTarget.style.color = "white"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white"
                      e.currentTarget.style.color = "black"
                    }}
                  >
                    {language === "hi" ? subDept.name_hi : subDept.name_en}
                  </button>
                ))}
                <button
                  onClick={() => {
                    fetchCases(noticeData.department!.id)
                    setStep(4)
                  }}
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    border: "2px solid #3b82f6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    color: "black",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                    e.currentTarget.style.color = "white"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white"
                    e.currentTarget.style.color = "black"
                  }}
                >
                  {language === "hi" ? "सभी केसेस देखें (बिना उप-विभाग)" : "View All Cases (Without Sub-Department)"}
                </button>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              style={{
                marginTop: "30px",
                padding: "12px 30px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )
      case 4:
        return (
          <div
            style={{
              padding: "30px",
              maxWidth: "900px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "black",
                marginBottom: "30px",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {language === "hi" ? "केस चुनें" : "Select Case"}
            </h2>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "black",
                  fontSize: "1.2rem",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "20px",
                  }}
                ></div>
                <div>{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</div>
              </div>
            ) : (
              <div style={{ marginTop: "20px" }}>
                {cases.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6b7280",
                      fontSize: "1.2rem",
                    }}
                  >
                    {language === "hi" ? "कोई केस नहीं मिला" : "No cases found"}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "20px" }}>
                    {cases.map((caseItem) => (
                      <div
                        key={caseItem._id}
                        onClick={() => handleCaseSelect(caseItem)}
                        style={{
                          padding: "25px",
                          border: "2px solid #e5e7eb",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: "white",
                          transition: "all 0.2s ease",
                          color: "black",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#3b82f6"
                          e.currentTarget.style.color = "white"
                          e.currentTarget.style.borderColor = "#3b82f6"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white"
                          e.currentTarget.style.color = "black"
                          e.currentTarget.style.borderColor = "#e5e7eb"
                        }}
                      >
                        <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2rem" }}>
                          {language === "hi" ? "केस नंबर:" : "Case Number:"} {caseItem.caseNumber}
                        </div>
                        <div style={{ marginBottom: "6px", fontSize: "1.05rem" }}>
                          {language === "hi" ? "याचिकाकर्ता:" : "Petitioner:"} {caseItem.petitionerName}
                        </div>
                        <div style={{ marginBottom: "8px", fontSize: "1.05rem" }}>
                          {language === "hi" ? "प्रतिवादी:" : "Respondent:"} {caseItem.respondentName}
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                          {language === "hi" ? "दाखिल दिनांक:" : "Filing Date:"}{" "}
                          {new Date(caseItem.filingDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                          {language === "hi" ? "स्थिति:" : "Status:"} {caseItem.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setStep(3)}
              style={{
                marginTop: "30px",
                padding: "12px 30px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )
      case 5:
        return (
          <div
            style={{
              padding: "30px",
              maxWidth: "900px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "black",
                marginBottom: "30px",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {language === "hi" ? "नोटिस संपादित करें" : "Edit Notice"}
            </h2>
            <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "पत्र संख्या:" : "Letter Number:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.letterNumber}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, letterNumber: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "दिनांक:" : "Date:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.date}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "black",
                    fontSize: "1rem",
                  }}
                >
                  {language === "hi" ? "विषय:" : "Subject:"}
                </label>
                <input
                  type="text"
                  value={noticeData.subject}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.2s ease",
                    outline: "none",
                    color: "black",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "black",
                    fontSize: "1rem",
                  }}
                >
                  {language === "hi" ? "सामग्री:" : "Content:"}
                </label>
                <textarea
                  value={noticeData.content}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "border-color 0.2s ease",
                    outline: "none",
                    color: "black",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "हस्ताक्षरकर्ता:" : "Signatory:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.signatory}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, signatory: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "पदनाम:" : "Designation:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.designation}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, designation: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" }}
              >
                <button
                  onClick={handlePrint}
                  style={{
                    padding: "15px 40px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }}
                >
                  {language === "hi" ? "प्रिंट करें" : "Print Notice"}
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  style={{
                    padding: "15px 40px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981"
                  }}
                >
                  {language === "hi" ? "ईमेल भेजें" : "Send Email"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    padding: "15px 30px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  {language === "hi" ? "वापस" : "Back"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "15px 30px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  {language === "hi" ? "नया नोटिस" : "New Notice"}
                </button>
              </div>
            </div>
          </div>
        )
      case 6: // Custom notice
        return (
          <div
            style={{
              padding: "30px",
              maxWidth: "900px",
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "black",
                marginBottom: "30px",
                fontSize: "1.8rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {language === "hi" ? "कस्टम नोटिस बनाएं" : "Create Custom Notice"}
            </h2>
            <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "पत्र संख्या:" : "Letter Number:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.letterNumber}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, letterNumber: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    placeholder={language === "hi" ? "पत्र संख्या दर्ज करें" : "Enter letter number"}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "दिनांक:" : "Date:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.date}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "black",
                    fontSize: "1rem",
                  }}
                >
                  {language === "hi" ? "विषय:" : "Subject:"}
                </label>
                <input
                  type="text"
                  value={noticeData.subject}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.2s ease",
                    outline: "none",
                    color: "black",
                  }}
                  placeholder={language === "hi" ? "विषय दर्ज करें" : "Enter subject"}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "black",
                    fontSize: "1rem",
                  }}
                >
                  {language === "hi" ? "नोटिस की सामग्री:" : "Notice Content:"}
                </label>
                <textarea
                  value={noticeData.content}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "border-color 0.2s ease",
                    outline: "none",
                    color: "black",
                  }}
                  placeholder={language === "hi" ? "अपना नोटिस यहाँ लिखें..." : "Write your notice here..."}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "हस्ताक्षरकर्ता:" : "Signatory:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.signatory}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, signatory: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    placeholder={language === "hi" ? "हस्ताक्षरकर्ता का नाम" : "Signatory name"}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "black",
                      fontSize: "1rem",
                    }}
                  >
                    {language === "hi" ? "पदनाम:" : "Designation:"}
                  </label>
                  <input
                    type="text"
                    value={noticeData.designation}
                    onChange={(e) => setNoticeData((prev) => ({ ...prev, designation: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s ease",
                      outline: "none",
                      color: "black",
                    }}
                    placeholder={language === "hi" ? "पदनाम दर्ज करें" : "Enter designation"}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" }}
              >
                <button
                  onClick={handlePrint}
                  style={{
                    padding: "15px 40px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }}
                >
                  {language === "hi" ? "प्रिंट करें" : "Print Notice"}
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  style={{
                    padding: "15px 40px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981"
                  }}
                >
                  {language === "hi" ? "ईमेल भेजें" : "Send Email"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "15px 30px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  {language === "hi" ? "वापस" : "Back"}
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${printStyles}
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "white",
          padding: "20px",
        }}
      >
        {/* Language Toggle Button - Always Visible */}
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
          className="no-print"
        >
          <button
            onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6"
            }}
          >
            {language === "hi" ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="no-print">{renderStep()}</div>

        {/* Email Modal */}
        <EmailModal />

        {/* Print Template */}
        <div id="printable-content" style={{ display: "none" }}>
          <div
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              backgroundColor: "white",
              fontFamily: language === "hi" ? "Noto Sans Devanagari, Arial, sans-serif" : "Times New Roman, serif",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "black",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                {language === "hi" ? "कार्यालय जिलाधिकारी, अयोध्या" : "Office of District Magistrate, Ayodhya"}
              </div>
              {noticeData.noticeType === "contempt" && (
                <div style={{ fontSize: "14px", color: "red", fontWeight: "bold" }}>
                  {language === "hi" ? "अति आवश्यक / सर्वोच्च प्राथमिकता" : "Most Urgent / Highest Priority"}
                </div>
              )}
            </div>
            {/* Date and Letter Number */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                {language === "hi" ? "दिनांक:" : "Date:"} {noticeData.date}
              </div>
              <div>
                {language === "hi" ? "पत्रांक:" : "Letter No:"} {noticeData.letterNumber}
              </div>
            </div>
            {/* Subject */}
            <div style={{ marginBottom: "20px" }}>
              <strong>{language === "hi" ? "विषय-" : "Subject-"}</strong> {noticeData.subject}
            </div>
            {/* Parties */}
            {noticeData.caseData && (
              <div style={{ marginBottom: "16px" }}>
                <div>
                  <strong>{language === "hi" ? "याचिकाकर्ता:" : "Petitioner:"}</strong> {noticeData.caseData.petitionerName}
                </div>
                <div>
                  <strong>{language === "hi" ? "प्रतिवादी:" : "Respondent:"}</strong> {noticeData.caseData.respondentName}
                </div>
              </div>
            )}
            {/* Addressee */}
            <div style={{ marginBottom: "20px" }}>
              {noticeData.department && (
                <div>
                  {language === "hi" ? noticeData.department.name_hi : noticeData.department.name_en}
                  {noticeData.subDepartment && (
                    <div>{language === "hi" ? noticeData.subDepartment.name_hi : noticeData.subDepartment.name_en}</div>
                  )}
                </div>
              )}
            </div>
            {/* Content */}
            <div style={{ marginBottom: "40px", textAlign: "justify", whiteSpace: "pre-line" }}>
              {noticeData.content}
            </div>
            {/* Copy to */}
            <div style={{ marginBottom: "20px" }}>
              <div>{language === "hi" ? "संख्या व दिनांक उपरोक्त।" : "Number and date as above."}</div>
              <div>
                {language === "hi"
                  ? "प्रतिलिपि-जिलाधिकारी, महोदय को सादर अवलोकनार्थ।"
                  : "Copy to- District Magistrate, Sir for kind perusal."}
              </div>
            </div>
            {/* Signature */}
            <div style={{ textAlign: "right", marginTop: "60px" }}>
              <div style={{ marginBottom: "60px" }}>{language === "hi" ? "हस्ताक्षर" : "Signature"}</div>
              <div>({noticeData.signatory})</div>
              <div>{noticeData.designation}</div>
              <div>{language === "hi" ? "अयोध्या।" : "Ayodhya."}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
