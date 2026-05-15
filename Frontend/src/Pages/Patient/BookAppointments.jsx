import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import PageLoader from "../../components/PageLoader";

const BookAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [reviewModal, setReviewModal] = useState({
    open: false,
    doctorName: "",
  });
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const fallbackDoctorImage = (doctorName) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      doctorName || "Doctor"
    )}&background=1d4ed8&color=ffffff&size=128&bold=true`;

  const getDoctorImageSrc = (doctor) => {
    const image = doctor?.image?.trim();
    if (image) {
      if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:image")
      ) {
        return image;
      }
      const normalizedPath = image.startsWith("/") ? image : `/${image}`;
      try {
        return new URL(normalizedPath, backendUrl).toString();
      } catch {
        return `${backendUrl}${normalizedPath}`;
      }
    }
    return fallbackDoctorImage(doctor?.name);
  };
  const getApiErrorMessage = (error, fallbackMessage) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return fallbackMessage;
  };

  const loadDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctors`,
        authHeader
      );
      if (data.success) {
        setDoctors(data.doctors || []);
      } else {
        message.error(data.message || "Unable to load doctors");
      }
    } catch (error) {
      console.error(error);
      message.error(getApiErrorMessage(error, "Unable to load doctors"));
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const loadReviews = async (doctorId) => {
    if (!doctorId) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctor/${doctorId}/reviews`,
        authHeader
      );
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        message.error(data.message || "Unable to load reviews");
      }
    } catch (error) {
      console.error(error);
      message.error(getApiErrorMessage(error, "Unable to load reviews"));
    }
  };

  useEffect(() => {
    if (!token) return;
    loadDoctors();
  }, [token]);

  const openDoctorDetails = (doctor) => {
    navigate(`/book-appointments/doctor/${doctor._id}`, { state: { doctor } });
  };

  const openReviewsModal = async (doctor) => {
    await loadReviews(doctor._id);
    setReviewModal({ open: true, doctorName: doctor.name });
  };

  const expertiseOptions = [
    "all",
    ...new Set(doctors.map((doctor) => doctor.expertise).filter(Boolean)),
  ];

  const filteredDoctors = [...doctors]
    .filter((doctor) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query || (doctor.name || "").toLowerCase().includes(query);
      const matchesExpertise =
        expertiseFilter === "all" || doctor.expertise === expertiseFilter;
      return matchesSearch && matchesExpertise;
    })
    .sort((a, b) => {
      if (sortBy === "rating-desc") return b.avgRating - a.avgRating;
      if (sortBy === "rating-asc") return a.avgRating - b.avgRating;
      if (sortBy === "charges-asc") return a.consultationCharge - b.consultationCharge;
      if (sortBy === "charges-desc") return b.consultationCharge - a.consultationCharge;
      return a.name.localeCompare(b.name);
    });

  const overallRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  if (isLoadingDoctors) {
    return <PageLoader minHeight={260} label="Loading doctors..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Book Appointments</h1>
      <p className="text-gray-600 mb-8">
        Browse registered doctors, check details, ratings, and book an available slot.
      </p>
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Find Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Doctor Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type doctor name"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Expertise
            </label>
            <select
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {expertiseOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Expertise" : option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Doctors
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="rating-desc">Top Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="charges-asc">Charges: Low to High</option>
              <option value="charges-desc">Charges: High to Low</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Showing <span className="font-semibold">{filteredDoctors.length}</span>{" "}
          doctor(s)
          {searchTerm.trim() ? ` | Search: "${searchTerm.trim()}"` : ""}
          {expertiseFilter !== "all" ? ` | Filter: ${expertiseFilter}` : ""}
          {" | "}
          Sort:{" "}
          <span className="font-medium">
            {sortBy === "rating-desc" && "Top Rated"}
            {sortBy === "rating-asc" && "Lowest Rated"}
            {sortBy === "charges-asc" && "Charges Low to High"}
            {sortBy === "charges-desc" && "Charges High to Low"}
            {sortBy === "name-asc" && "Name A-Z"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => openDoctorDetails(doctor)}
              className="bg-white shadow rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex gap-4">
                <img
                  src={getDoctorImageSrc(doctor)}
                  alt={doctor.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackDoctorImage(doctor?.name);
                  }}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{doctor.name}</h2>
                  <p className="text-sm text-gray-600">{doctor.expertise}</p>
                  <p className="text-sm text-gray-600">
                    Contact: {doctor.phone || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">Address: {doctor.address || "N/A"}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="font-medium">
                      Charges: Rs. {doctor.consultationCharge}
                    </span>
                    <span>
                      Rating: {doctor.avgRating} ({doctor.ratingCount} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDoctorDetails(doctor);
                    }}
                    className="h-fit px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewsModal(doctor);
                    }}
                    className="h-fit px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!filteredDoctors.length && (
            <p className="text-gray-500">No doctors match your search/filter.</p>
          )}
        </div>
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <h3 className="text-lg font-semibold mb-3">
              Ratings & Reviews - {reviewModal.doctorName}
            </h3>
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-semibold">
                Overall Rating: {overallRating}/5
              </p>
              <p className="text-sm text-gray-600">
                Total Patient Reviews: {reviews.length}
              </p>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {reviews.map((item) => (
                <div key={item._id} className="border rounded-lg p-2">
                  <p className="text-sm font-medium">
                    Review by: {item.patientName || "Patient"}
                  </p>
                  <p className="text-sm">Rating: {item.rating}/5</p>
                  <p className="text-sm text-gray-700">
                    Review: {item.review || "-"}
                  </p>
                </div>
              ))}
              {!reviews.length && (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setReviewModal({ open: false, doctorName: "" })}
                className="px-3 py-1 rounded border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointments;
