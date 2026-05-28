import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "complaints", name: "Complaint Registration" },
    { id: "tracking", name: "Tracking & Status" },
    { id: "services", name: "Municipal Services" },
    { id: "account", name: "Account & Profile" },
    { id: "technical", name: "Technical Support" },
  ];

  const faqData = [
    {
      id: 1,
      category: "complaints",
      question: "How do I register a complaint?",
      answer:
        'To register a complaint, navigate to the "Register Complaint" page, fill out the required information including description, category, priority, and location. You can also upload photos and use voice recording for better documentation.',
    },
    {
      id: 2,
      category: "complaints",
      question: "What types of complaints can I submit?",
      answer:
        "You can submit complaints related to roads & transportation, water supply, electricity, waste management, drainage, parks & recreation, noise pollution, street lighting, and other municipal services.",
    },
    {
      id: 3,
      category: "tracking",
      question: "How can I track my complaint status?",
      answer:
        "After submitting a complaint, you will receive a unique tracking number via SMS and email. Use this number on our tracking portal to monitor the progress of your complaint from submission to resolution.",
    },
    {
      id: 4,
      category: "tracking",
      question: "What do the different status indicators mean?",
      answer:
        "Status indicators include: Submitted (complaint received), Under Review (being assessed), Assigned (sent to relevant department), In Progress (work started), and Resolved (issue fixed and verified).",
    },
    {
      id: 5,
      category: "services",
      question: "What is the typical response time for complaints?",
      answer:
        "Response times vary by priority: Emergency issues - within 2 hours, High priority - within 24 hours, Medium priority - within 72 hours, Low priority - within 7 days. Complex issues may take longer but you will be updated regularly.",
    },
    {
      id: 6,
      category: "services",
      question: "Can I submit anonymous complaints?",
      answer:
        "While we encourage providing contact information for updates and clarification, you can submit anonymous complaints. However, this may limit our ability to provide status updates and gather additional information if needed.",
    },
    {
      id: 7,
      category: "account",
      question: "Do I need to create an account to submit complaints?",
      answer:
        "No, account creation is optional. You can submit complaints as a guest user. However, creating an account allows you to track all your complaints, receive notifications, and manage your profile for faster future submissions.",
    },
    {
      id: 8,
      category: "technical",
      question: "What photo formats are supported for uploads?",
      answer:
        "We support common image formats including JPEG, PNG, GIF, and WebP. Maximum file size is 10MB per image, and you can upload up to 5 photos per complaint. For best results, use clear, well-lit photos that clearly show the issue.",
    },
    {
      id: 9,
      category: "technical",
      question: "The website is not working properly. What should I do?",
      answer:
        "Try refreshing the page or clearing your browser cache. If issues persist, contact our technical support at support@muniportal.gov or call our helpline. For urgent complaints, you can also call our 24/7 emergency hotline.",
    },
    {
      id: 10,
      category: "services",
      question: "How are complaint priorities determined?",
      answer:
        "Priorities are initially set by citizens but may be adjusted by our team based on severity and public safety impact. Emergency issues (gas leaks, major water breaks) receive immediate attention, while cosmetic issues are handled during regular maintenance schedules.",
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-background-light py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <HelpCircle className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-text mb-4">
            Frequently Asked Questions
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <Card className="sticky top-8">
              <h3 className="font-semibold text-text mb-4">Search & Filter</h3>

              {/* Search */}
              <motion.div
                className="mb-6"
                whileFocus="focused"
                variants={{
                  focused: { scale: 1.02 },
                }}
              >
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light" />
                  </motion.div>
                  <motion.input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                className="space-y-2"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                <h4 className="font-medium text-text mb-3">Categories</h4>
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? "bg-primary text-white"
                        : "text-text-light hover:bg-gray-100 hover:text-text"
                    }`}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </motion.div>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-text mb-4">Still Need Help?</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-text-light">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-sm text-text-light">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>support@muniportal.gov</span>
                  </div>
                  <div className="flex items-center text-sm text-text-light">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>24/7 Emergency Line</span>
                  </div>
                </div>
                <Button variant="primary" size="sm" className="w-full mt-4">
                  Contact Support
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* FAQ Content */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center py-12">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <HelpCircle className="h-12 w-12 text-text-lighter mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-text mb-2">
                    No FAQs Found
                  </h3>
                  <p className="text-text-light">
                    Try adjusting your search terms or select a different
                    category.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    layout
                  >
                    <Card className="p-0 overflow-hidden">
                      <motion.button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <h3 className="font-medium text-text pr-4 flex-1">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-3">
                          <motion.span
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide"
                            whileHover={{ scale: 1.05 }}
                          >
                            {categories.find((cat) => cat.id === faq.category)
                              ?.name || faq.category}
                          </motion.span>
                          <motion.div
                            animate={{
                              rotate: expandedItems.has(faq.id) ? 180 : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <ChevronDown className="h-4 w-4 text-primary-500" />
                          </motion.div>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedItems.has(faq.id) && (
                          <motion.div
                            className="overflow-hidden border-t border-gray-100"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.4,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            }}
                          >
                            <motion.div
                              className="px-6 pb-6"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.1,
                                ease: "easeOut",
                              }}
                            >
                              <p className="text-text-light leading-relaxed pt-4">
                                {faq.answer}
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
