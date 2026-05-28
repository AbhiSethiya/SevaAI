import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  Upload,
  User,
  X,
} from "lucide-react";
import Button from "../components/common/Button";
import { complaintAPI } from "../lib/api";
import { startRecording, stopRecording } from "../lib/speechAPI";
import { SpeechAPI } from "../lib/speechAPI";

// Step Components
const StepIndicator = ({ steps, currentStep, goToStep }) => {
  return (
    <motion.div
      className="flex items-center justify-center mb-6 sm:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <motion.div
              className={`flex items-center justify-center w-12 h-12 min-w-12 min-h-12 rounded-full border-2 cursor-pointer transition-all shadow-sm flex-shrink-0 ${
                currentStep >= step.id
                  ? "bg-blue-600 border-blue-600 text-white shadow-blue-200"
                  : "border-gray-300 text-gray-400 bg-white hover:border-gray-400"
              }`}
              onClick={() => goToStep(step.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={currentStep >= step.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={
                  currentStep >= step.id ? { rotate: 360 } : { rotate: 0 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <step.icon className="w-6 h-6" />
              </motion.div>
            </motion.div>
            <motion.p
              className={`text-sm font-medium mt-3 ${
                currentStep >= step.id ? "text-blue-600" : "text-gray-400"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {step.title}
            </motion.p>
          </div>
          {index < steps.length - 1 && (
            <motion.div
              className={`w-24 h-0.5 mx-4 ${
                currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};
const Step1ComplaintDetails = ({
  formData,
  handleInputChange,
  errors,
  touched,
  categories,
  isRecording,
  recordingField,
  onMicToggle,
}) => (
  <motion.div
    className="space-y-6"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
          Complaint Title <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center gap-2">
          <motion.input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the issue"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            type="button"
            onClick={() => onMicToggle("title")}
            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg transition-all ${
              isRecording && recordingField === "title"
                ? "bg-red-500 text-white shadow-lg shadow-red-200"
                : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={
              isRecording && recordingField === "title"
                ? { scale: [1, 1.1, 1] }
                : {}
            }
            transition={
              isRecording && recordingField === "title"
                ? { duration: 0.8, repeat: Infinity }
                : { duration: 0.2 }
            }
            title={isRecording && recordingField === "title" ? "Stop recording" : "Speak title"}
          >
            {isRecording && recordingField === "title" ? (
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </motion.button>
        </div>
        <AnimatePresence>
          {touched.title && errors.title && (
            <motion.p
              className="mt-2 text-red-500 text-xs sm:text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {errors.title}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
          Category <span className="text-red-500">*</span>
        </label>
        <motion.select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </motion.select>
        <AnimatePresence>
          {touched.category && errors.category && (
            <motion.p
              className="mt-2 text-red-500 text-xs sm:text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {errors.category}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
        Detailed Description <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <motion.textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Provide detailed information about the issue (or use the mic button)"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          type="button"
          onClick={() => onMicToggle("description")}
          className={`absolute right-2 top-2 p-2 sm:p-3 rounded-lg transition-all ${
            isRecording && recordingField === "description"
              ? "bg-red-500 text-white shadow-lg shadow-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={
            isRecording && recordingField === "description"
              ? { scale: [1, 1.1, 1] }
              : {}
          }
          transition={
            isRecording && recordingField === "description"
              ? { duration: 0.8, repeat: Infinity }
              : { duration: 0.2 }
          }
          title={isRecording && recordingField === "description" ? "Stop recording" : "Speak description"}
        >
          {isRecording && recordingField === "description" ? (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </motion.button>
      </div>
      <AnimatePresence>
        {isRecording && recordingField === "description" && (
          <motion.p
            className="mt-1 text-red-500 text-xs flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Recording... Click the mic button to stop
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {touched.description && errors.description && (
          <motion.p
            className="mt-2 text-red-500 text-xs sm:text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {errors.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  </motion.div>
);

const Step2LocationInfo = ({
  formData,
  handleInputChange,
  errors,
  touched,
  coordinates,
  locationLoading,
  fetchLocation,
}) => (
  <motion.div
    className="space-y-6"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
          Location Address <span className="text-red-500">*</span>
        </label>
        <motion.input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Enter the complete address"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />
        <AnimatePresence>
          {touched.location && errors.location && (
            <motion.p
              className="mt-2 text-red-500 text-xs sm:text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {errors.location}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
          Nearby Landmark
        </label>
        <motion.input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleInputChange}
          placeholder="Any nearby landmark"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </motion.div>

    <motion.div
      className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ backgroundColor: "#f8fafc" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: coordinates ? [1, 1.2, 1] : 1,
              rotate: coordinates ? [0, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <MapPin className="w-5 h-5 text-gray-600" />
          </motion.div>
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              GPS Location
            </p>
            <motion.p
              className="text-gray-600 text-xs sm:text-sm"
              key={coordinates ? "found" : "not-found"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {coordinates
                ? `Lat: ${coordinates.lat.toFixed(
                    6
                  )}, Lng: ${coordinates.lng.toFixed(6)}`
                : "Location not detected"}
            </motion.p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            onClick={fetchLocation}
            disabled={locationLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            {locationLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.div>
            ) : (
              "Get Location"
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

const Step3UploadEvidence = ({
  files,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileUpload,
  removeFile,
}) => (
  <div className="space-y-6">
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">
        Drag and drop images here, or{" "}
        <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
          browse to upload
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </p>
      <p className="text-gray-500 text-sm">Maximum 5MB per file</p>
    </div>

    {files.length > 0 && (
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Uploaded Files ({files.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Step4ContactDetails = ({
  formData,
  handleInputChange,
  errors,
  touched,
  languages,
}) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="contactName"
          value={formData.contactName}
          onChange={handleInputChange}
          placeholder="Your full name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {touched.contactName && errors.contactName && (
          <p className="mt-2 text-red-500 text-sm">{errors.contactName}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleInputChange}
          placeholder="Your contact number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {touched.contactPhone && errors.contactPhone && (
          <p className="mt-2 text-red-500 text-sm">{errors.contactPhone}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Email Address (Optional)
        </label>
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleInputChange}
          placeholder="Your email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {touched.contactEmail && errors.contactEmail && (
          <p className="mt-2 text-red-500 text-sm">{errors.contactEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Preferred Language
        </label>
        <select
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

const ComplaintRegistration = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    landmark: "",
    language: "en",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);

  const steps = [
    { id: 1, title: "Complaint Details", icon: MessageSquare },
    { id: 2, title: "Location Info", icon: MapPin },
    { id: 3, title: "Upload Evidence (Optional)", icon: Camera },
    { id: 4, title: "Contact Details", icon: User },
  ];

  const categories = [
    { value: "road", label: "Road Maintenance" },
    { value: "water", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "waste", label: "Garbage Collection" },
    { value: "drainage", label: "Sewage & Drainage" },
    { value: "other", label: "Other" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी (Hindi)" },
    { value: "bn", label: "বাংলা (Bengali)" },
    { value: "te", label: "తెలుగు (Telugu)" },
    { value: "mr", label: "मराठी (Marathi)" },
    { value: "ta", label: "தமிழ் (Tamil)" },
    { value: "gu", label: "ગુજરાતી (Gujarati)" },
    { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { value: "ml", label: "മലയാളം (Malayalam)" },
    { value: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  ];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Step navigation
  const nextStep = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const goToStep = (step) => {
    // Only allow going to a step if current step is valid or going backwards
    if (step <= currentStep) {
      setCurrentStep(step);
      setErrors({});
    } else {
      // If trying to go forward, validate current step first
      const stepErrors = validateCurrentStep();
      if (Object.keys(stepErrors).length === 0) {
        setCurrentStep(step);
        setErrors({});
      } else {
        setErrors(stepErrors);
      }
    }
  };

  // Mic toggle handler for speech-to-text
  const handleMicToggle = useCallback(async (fieldName) => {
    if (isRecording && recordingField === fieldName) {
      // Stop recording
      try {
        setIsRecording(false);
        const audioBlob = await stopRecording();
        const speechApi = SpeechAPI.getInstance();
        const text = await speechApi.speechToText(audioBlob);
        if (text) {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: prev[fieldName] ? prev[fieldName] + " " + text : text,
          }));
          setTouched((prev) => ({ ...prev, [fieldName]: true }));
          if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: "" }));
          }
        }
      } catch (error) {
        console.error("Speech-to-text error:", error);
        alert("Failed to convert speech to text. Please try again or type manually.");
      } finally {
        setRecordingField(null);
      }
    } else {
      // Start recording
      try {
        // Stop any existing recording first
        if (isRecording) {
          await stopRecording().catch(() => {});
        }
        await startRecording();
        setIsRecording(true);
        setRecordingField(fieldName);
      } catch (error) {
        console.error("Microphone error:", error);
        alert("Could not access microphone. Please check browser permissions.");
        setIsRecording(false);
        setRecordingField(null);
      }
    }
  }, [isRecording, recordingField, errors]);

  // Step-specific validation
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        break;
      case 2:
        if (!formData.location.trim())
          newErrors.location = "Location is required";
        break;
      case 3:
        // File upload is optional, no validation needed
        break;
      case 4:
        if (!formData.contactName.trim())
          newErrors.contactName = "Name is required";
        if (!formData.contactPhone.trim())
          newErrors.contactPhone = "Phone number is required";
        break;
    }

    return newErrors;
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Location fetch
  const fetchLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationLoading(false);
          alert("Could not fetch location. Please check permissions.");
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.contactName.trim())
      newErrors.contactName = "Name is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Phone number is required";

    return newErrors;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ComplaintDetails
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            touched={touched}
            categories={categories}
            isRecording={isRecording}
            recordingField={recordingField}
            onMicToggle={handleMicToggle}
          />
        );
      case 2:
        return (
          <Step2LocationInfo
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            touched={touched}
            coordinates={coordinates}
            locationLoading={locationLoading}
            fetchLocation={fetchLocation}
          />
        );
      case 3:
        return (
          <Step3UploadEvidence
            files={files}
            isDragOver={isDragOver}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
          />
        );
      case 4:
        return (
          <Step4ContactDetails
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            touched={touched}
            languages={languages}
          />
        );
      default:
        return (
          <Step1ComplaintDetails
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            touched={touched}
            categories={categories}
            isRecording={isRecording}
            recordingField={recordingField}
            onMicToggle={handleMicToggle}
          />
        );
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps before submission
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Go back to the first step with errors
      if (formErrors.title || formErrors.description || formErrors.category) {
        setCurrentStep(1);
      } else if (formErrors.location) {
        setCurrentStep(2);
      } else if (formErrors.contactName || formErrors.contactPhone) {
        setCurrentStep(4);
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare complaint data for API submission
      const complaintData = {
        ...formData,
        files: files,
      };

      // Add coordinates if available
      if (coordinates) {
        complaintData.coordinates = coordinates;
      }

      const result = await complaintAPI.submitComplaint(complaintData);
      setTicketId(result.ticketId);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setErrors({ submit: "Failed to submit complaint. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Complaint Registered Successfully
            </h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-green-800 text-lg mb-2">
                Your complaint has been registered
              </p>
              <p className="text-2xl font-bold text-green-900">
                Ticket ID: {ticketId}
              </p>
            </div>
            <p className="text-gray-600 mb-8">
              You will receive updates on this complaint via email/SMS. Our team
              will review and assign it to the appropriate department for
              resolution.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/my-complaints">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Track Complaint
                </Button>
              </Link>
              <Link to="/register-complaint">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Submit Another
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 py-6 sm:py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4"
            animate={{
              textShadow: [
                "0 0 10px rgba(255,255,255,0.3)",
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 10px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Register a Complaint
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Submit your civic complaints and track their resolution. Help us
            improve municipal services for better governance.
          </motion.p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
        >
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-6">
              {/* Step Indicator */}
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                goToStep={goToStep}
              />

              {/* Step Content */}
              <motion.div
                className="min-h-[300px] sm:min-h-[400px]"
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h2
                  className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 border-b border-gray-200 pb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps.find((step) => step.id === currentStep)?.title}
                </motion.h2>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-6 sm:pt-8 gap-4 sm:gap-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="order-2 sm:order-1">
                  {currentStep > 1 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        Previous
                      </Button>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  className="text-center order-1 sm:order-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Step {currentStep} of {steps.length}
                  </span>
                </motion.div>

                <div className="order-3">
                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
                          {errors.submit}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {currentStep < steps.length ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      >
                        Next
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            </motion.div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Submit Complaint
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </form>
          </div>

          {/* Information Sidebar */}
          <motion.div
            className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                  Response Times
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Issues</span>
                    <span className="font-medium text-red-600">2-4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgent Issues</span>
                    <span className="font-medium text-orange-600">
                      24 hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Normal Issues</span>
                    <span className="font-medium text-green-600">3-7 days</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li>• Provide clear photos of the issue</li>
                  <li>• Include exact location details</li>
                  <li>• Be specific about the problem</li>
                  <li>• Keep contact information updated</li>
                </ul>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                  Need Help?
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Helpline</p>
                      <p className="text-gray-600">1800-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@municipality.gov</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComplaintRegistration;
