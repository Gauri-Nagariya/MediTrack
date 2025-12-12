// import React, { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../Context/AppContext";
// // import React, { useState, useContext } from "react";  // <-- add useContext
// // import { AppContext } from "../../Context/AppContext";   // <-- import your context


// export default function CreateProfile() {
//   const navigate = useNavigate();

//   const { user } = useContext(AppContext);
// const userId = user?._id;

//   const [formData, setFormData] = useState({
//     fullName: "",
//     dateOfBirth: "",
//     gender: "",
//     bloodGroup: "",
//     height: "",
//     weight: "",
//     profilePhoto: null,
//     phone: "",
//     address: "",
//     emergencyContactName: "",
//     emergencyContactPhone: "",

//     allergies: "",
//     chronicConditions: "",
//     medications: "",
//     surgeries: "",
//     familyHistory: "",
//     disabilities: "",
//     healthId: "",
//     preferredHospital: "",
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData({
//       ...formData,
//       [name]: files ? files[0] : value,
//     });
//   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();

// //     localStorage.setItem("hasProfile", "true");
// //     navigate("/Records");
// //   };


// const handleSubmit = async (e) => {
//   e.preventDefault();

// await fetch("http://localhost:5000/api/profile/create", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     userId,  // ✅ now dynamic
//     ...formData,
//   }),
// });

//   navigate("/Records");
// };
//   return (
//     <div className="flex justify-center min-h-screen bg-gray-100 py-10">
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
//         <h1 className="text-3xl font-bold text-center mb-6">
//           Create Your Medical Profile
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">


//           {/* ------------------ PERSONAL INFORMATION ------------------ */}
//           <h2 className="text-xl font-semibold text-blue-600">Personal Information</h2>

//           {/* Full Name */}
//           <div>
//             <label>Full Name</label>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* DOB */}
//           <div>
//             <label>Date of Birth</label>
//             <input
//               type="date"
//               name="dateOfBirth"
//               value={formData.dateOfBirth}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Gender + Blood Group */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label>Gender</label>
//               <select
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-2 border rounded-lg"
//               >
//                 <option value="">Select</option>
//                 <option>Male</option>
//                 <option>Female</option>
//                 <option>Other</option>
//                 <option>Prefer Not to Say</option>
//               </select>
//             </div>

//             <div>
//               <label>Blood Group</label>
//               <select
//                 name="bloodGroup"
//                 value={formData.bloodGroup}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//               >
//                 <option value="">Select</option>
//                 <option>A+</option><option>A-</option>
//                 <option>B+</option><option>B-</option>
//                 <option>O+</option><option>O-</option>
//                 <option>AB+</option><option>AB-</option>
//               </select>
//             </div>
//           </div>

//           {/* Height + Weight */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label>Height (cm)</label>
//               <select
//                 name="height"
//                 value={formData.height}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//               >
//                 <option value="">Select</option>
//                 {[...Array(70)].map((_, i) => (
//                   <option key={i}>{140 + i}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label>Weight (kg)</label>
//               <select
//                 name="weight"
//                 value={formData.weight}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//               >
//                 <option value="">Select</option>
//                 {[...Array(101)].map((_, i) => (
//                   <option key={i}>{30 + i}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Profile Photo */}
//           {/* <div>
//             <label>Profile Photo</label>
//             <input
//               type="file"
//               name="profilePhoto"
//               accept="image/*"
//               onChange={handleChange}
//               className="w-full"
//             />
//           </div> */}

//           {/* Phone */}
//           <div>
//             <label>Phone Number</label>
//             <input
//               type="text"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Address */}
//           <div>
//             <label>Address</label>
//             <input
//               type="text"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Emergency Contact */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label>Emergency Contact Name</label>
//               <input
//                 type="text"
//                 name="emergencyContactName"
//                 value={formData.emergencyContactName}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//               />
//             </div>

//             <div>
//               <label>Emergency Contact Phone</label>
//               <input
//                 type="text"
//                 name="emergencyContactPhone"
//                 value={formData.emergencyContactPhone}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-lg"
//               />
//             </div>
//           </div>


//           {/* ------------------ MEDICAL INFORMATION ------------------ */}
//           <h2 className="text-xl font-semibold text-blue-600">Medical Information</h2>

//           {/* Allergies */}
//           <div>
//             <label>Known Allergies</label>
//             <select
//               name="allergies"
//               value={formData.allergies}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             >
//               <option value="">None</option>
//               <option>Dust</option>
//               <option>Pollen</option>
//               <option>Food Allergies</option>
//               <option>Medicine Allergies</option>
//               <option>Insect Allergy</option>
//               <option>Latex Allergy</option>
//               <option>Other</option>
//             </select>
//           </div>

//           {/* Chronic Conditions */}
//           <div>
//             <label>Chronic Conditions</label>
//             <select
//               name="chronicConditions"
//               value={formData.chronicConditions}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             >
//               <option value="">None</option>
//               <option>Diabetes</option>
//               <option>High Blood Pressure</option>
//               <option>Asthma</option>
//               <option>Thyroid Disorder</option>
//               <option>Heart Disease</option>
//               <option>Kidney Disorder</option>
//               <option>Mental Health Condition</option>
//               <option>Other</option>
//             </select>
//           </div>

//           {/* Disabilities */}
//           <div>
//             <label>Disabilities (if any)</label>
//             <select
//               name="disabilities"
//               value={formData.disabilities}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             >
//               <option value="">None</option>
//               <option>Hearing Disability</option>
//               <option>Movement Disability</option>
//               <option>Vision Disability</option>
//               <option>Cognitive Disability</option>
//               <option>Other</option>
//             </select>
//           </div>

//           {/* Medications */}
//           <div>
//             <label>Current Medications</label>
//             <textarea
//               name="medications"
//               value={formData.medications}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Surgeries */}
//           <div>
//             <label>Past Surgeries</label>
//             <textarea
//               name="surgeries"
//               value={formData.surgeries}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Family History */}
//           <div>
//             <label>Family Medical History</label>
//             <textarea
//               name="familyHistory"
//               value={formData.familyHistory}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Health ID */}
//           <div>
//             <label>Health ID (Optional)</label>
//             <input
//               type="text"
//               name="healthId"
//               value={formData.healthId}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* Preferred Hospital */}
//           <div>
//             <label>Preferred Hospital / Clinic</label>
//             <input
//               type="text"
//               name="preferredHospital"
//               value={formData.preferredHospital}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg"
//             />
//           </div>

//           {/* SUBMIT BUTTON */}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white p-3 rounded-xl cursor-pointer text-lg"
//           >
//             Save Profile
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
