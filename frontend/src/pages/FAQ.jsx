import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft, Leaf, UploadCloud, Shield, Clock, MessageCircle, Mail, BookOpen } from 'lucide-react';

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      question: "How does PlanTech work?",
      answer: "PlanTech uses advanced AI technology to analyze images of plant leaves and identify potential diseases. Simply upload a clear photo of a plant leaf, and our system will provide you with a diagnosis along with a confidence score. The AI model has been trained on thousands of plant disease images to ensure accurate results.",
      icon: <Leaf className="w-5 h-5 text-green-500" />
    },
    {
      question: "What types of plant diseases can you detect?",
      answer: "Our system can detect various common plant diseases including powdery mildew, rust, leaf spots, blight, and other fungal and bacterial infections. We're constantly improving our model to recognize more disease types and provide more accurate diagnoses.",
      icon: <Shield className="w-5 h-5 text-blue-500" />
    },
    {
      question: "How accurate are the results?",
      answer: "Our AI model typically achieves high accuracy rates, especially for common plant diseases. Each result comes with a confidence score that indicates how certain the system is about the diagnosis. For best results, ensure your images are clear, well-lit, and show the affected area clearly.",
      icon: <HelpCircle className="w-5 h-5 text-purple-500" />
    },
    {
      question: "What image formats are supported?",
      answer: "We support common image formats including JPG, PNG, GIF, and WebP. For optimal results, we recommend using high-quality images (at least 1MB) with good lighting and clear focus on the plant leaves. Avoid blurry or heavily compressed images.",
      icon: <UploadCloud className="w-5 h-5 text-orange-500" />
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take your privacy seriously. All uploaded images are processed securely and are not shared with third parties. We use industry-standard encryption to protect your data, and you have full control over your analysis history.",
      icon: <Shield className="w-5 h-5 text-green-500" />
    },
    {
      question: "How long does analysis take?",
      answer: "Analysis typically takes just a few seconds. The exact time depends on image size and server load, but most results are available within 10-30 seconds. You'll see a progress indicator while the analysis is running.",
      icon: <Clock className="w-5 h-5 text-blue-500" />
    },
    {
      question: "Can I analyze multiple images at once?",
      answer: "Yes! PlanTech supports batch processing for multiple images. You can upload several images simultaneously using our drag-and-drop interface. Each image will be analyzed individually, and you'll receive comprehensive results for all uploads.",
      icon: <UploadCloud className="w-5 h-5 text-deer" />
    },
    {
      question: "What should I do if the confidence score is low?",
      answer: "If you receive a low confidence score, try uploading a clearer, higher-resolution image with better lighting. Make sure the affected area is clearly visible and the image isn't blurry. You can also try taking the photo from different angles.",
      icon: <HelpCircle className="w-5 h-5 text-yellow-500" />
    },
    {
      question: "Do you provide treatment recommendations?",
      answer: "Currently, we focus on disease detection and identification. While we don't provide specific treatment recommendations, we do provide detailed information about the detected disease, which can help you research appropriate treatment options.",
      icon: <BookOpen className="w-5 h-5 text-royalbrown" />
    },
    {
      question: "How can I improve my analysis results?",
      answer: "For best results: 1) Use good lighting (natural light works best), 2) Take clear, focused photos, 3) Include the entire affected leaf in the frame, 4) Avoid shadows or reflections, 5) Use a high-resolution camera or smartphone, 6) Ensure the image shows the disease symptoms clearly.",
      icon: <Leaf className="w-5 h-5 text-asparagus" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-asparagus/5 via-white to-deer/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-axolotl hover:text-pathlo dark:text-gray-400 dark:hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-asparagus to-deer rounded-full mb-6 shadow-xl">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-hank text-pathlo dark:text-white mb-6">
              Help & Support
            </h1>
            <p className="text-xl font-helvetica text-axolotl dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about PlanTech and plant disease detection. Our comprehensive guide covers everything you need to know.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">99.8%</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Accuracy Rate</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">&lt;5s</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Analysis Time</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">100%</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Data Secure</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-hank text-pathlo dark:text-white mb-2">5+</div>
            <div className="text-sm text-axolotl dark:text-gray-400 font-medium">Disease Types</div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-100 dark:border-gray-700 mb-12">
          <div className="bg-gradient-to-r from-asparagus/10 to-deer/10 dark:from-asparagus/20 dark:to-deer/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-hank text-pathlo dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-asparagus" />
              Frequently Asked Questions
            </h2>
          </div>
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  {item.icon}
                  <h3 className="font-hank text-lg text-pathlo dark:text-white pr-4 group-hover:text-asparagus transition-colors duration-300">
                    {item.question}
                  </h3>
                </div>
                {openItems.has(index) ? (
                  <ChevronUp className="w-6 h-6 text-asparagus flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-asparagus flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                )}
              </button>
              {openItems.has(index) && (
                <div className="px-6 pb-6 bg-gray-50/50 dark:bg-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-300 font-helvetica leading-relaxed pl-9">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-asparagus/10 to-deer/10 dark:from-asparagus/20 dark:to-deer/20 rounded-2xl p-8 border border-asparagus/20">
          <div className="text-center">
            <h2 className="text-3xl font-hank text-pathlo dark:text-white mb-4">Still Have Questions?</h2>
            <p className="text-lg text-axolotl dark:text-gray-400 mb-8 font-helvetica max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of PlanTech!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="group bg-gradient-to-r from-deer to-royalbrown hover:from-royalbrown hover:to-deer text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-3"
              >
                <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Start Analysis
              </Link>
              <a
                href="mailto:support@plantech.com"
                className="group bg-gradient-to-r from-pathlo to-axolotl hover:from-axolotl hover:to-pathlo text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-3"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Contact Support
              </a>
            </div>
            <div className="mt-6 text-sm text-axolotl dark:text-gray-400">
              📧 support@plantech.com • 📱 +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 