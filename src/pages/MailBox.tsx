import { FC, useState } from "react";
import {
  Send,
  FileText,
  Trash2,
  Menu,
  X,
  Reply,
  Forward,
  Mail, // ✅ email icon
} from "lucide-react";

interface Mail {
  id: number;
  sender: string;
  subject: string;
  time: string;
  preview: string;
  content: string;
}

const mockMails: Mail[] = [
  {
    id: 1,
    sender: "Pepper Potts",
    subject: "Food App IOS & Android - Need confirmation",
    time: "11:50 AM",
    preview: "Need confirmation of final design...",
    content:
      "Hi John, we need your confirmation on the final design for the Food App. Please review and reply asap.",
  },
  {
    id: 2,
    sender: "Tony Stark",
    subject: "Arc Reactor Blueprint Update",
    time: "9:30 AM",
    preview: "Updated blueprint has been attached...",
    content:
      "Hey, I’ve updated the arc reactor blueprints. Please find attached and let me know your feedback.",
  },
  {
    id: 3,
    sender: "Steve Rogers",
    subject: "Meeting Tomorrow",
    time: "Yesterday",
    preview: "Let’s meet tomorrow to discuss strategy...",
    content:
      "John, let’s have a strategy meeting tomorrow at 10:00 AM in the main hall. Regards, Steve.",
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: i + 4,
    sender: "User " + (i + 4),
    subject: "Test Mail " + (i + 4),
    time: "10:00 AM",
    preview: "This is a sample preview for mail " + (i + 4),
    content: "This is the full content of mail " + (i + 4),
  })),
];

const MailBox: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  // Reusable Sidebar Buttons
  const SidebarButtons = () => (
    <nav className="flex-1 p-2 space-y-2">
      <button
        onClick={() => {
          setActiveTab("all");
          setSelectedMail(null);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
          activeTab === "all" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        <Mail className="w-5 h-5" /> All Mail
      </button>
      <button
        onClick={() => {
          setActiveTab("send");
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
          activeTab === "send" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        <Send className="w-5 h-5" /> Send Mail
      </button>
      <button
        onClick={() => {
          setActiveTab("drafts");
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
          activeTab === "drafts" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        <FileText className="w-5 h-5" /> Drafts
      </button>
      <button
        onClick={() => {
          setActiveTab("trash");
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
          activeTab === "trash" ? "bg-blue-100" : "hover:bg-gray-100"
        }`}
      >
        <Trash2 className="w-5 h-5" /> Trash
      </button>
    </nav>
  );

  const renderContent = () => {
    if (activeTab === "all" && !selectedMail) {
      return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4">📨 All Mails</h2>
          <div className="space-y-3">
            {mockMails.map((mail) => (
              <div
                key={mail.id}
                onClick={() => setSelectedMail(mail)}
                className="p-3 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm sm:text-base">
                    {mail.sender}
                  </h4>
                  <span className="text-xs text-gray-400">{mail.time}</span>
                </div>
                <p className="text-sm sm:text-base font-medium truncate">
                  {mail.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">{mail.preview}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "all" && selectedMail) {
      return (
        <>
          {/* Mail Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4 bg-white gap-2">
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                {selectedMail.sender}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {selectedMail.subject}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-gray-500">{selectedMail.time}</span>
              <button
                onClick={() => setSelectedMail(null)}
                className="px-3 py-1 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Back
              </button>
            </div>
          </div>

          {/* Mail Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            <p className="text-gray-700 leading-relaxed mb-4">
              {selectedMail.content}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <button className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                <Reply className="w-4 h-4" /> Reply
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                <Forward className="w-4 h-4" /> Forward
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "send") {
      return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Compose Mail</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="To"
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full border rounded-md px-3 py-2"
            />
            <textarea
              placeholder="Write your message..."
              className="w-full border rounded-md px-3 py-2 h-40"
            ></textarea>
            <div className="border rounded-md p-4 bg-white">
              <label className="block font-medium mb-2">📎 Attach files</label>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 
                         file:rounded-md file:border-0 
                         file:bg-blue-50 file:text-blue-700 
                         hover:file:bg-blue-100"
              />
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a tab
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:w-64 bg-white shadow-lg flex-col">
        <div className="p-4 font-bold text-lg border-b">Inbox</div>
        <SidebarButtons />
      </aside>

      {/* Sidebar (Mobile Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-50 w-64 bg-white shadow-lg flex flex-col">
            <div className="p-4 font-bold text-lg border-b flex justify-between items-center">
              Inbox
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <SidebarButtons />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Mobile Topbar */}
        <div className="md:hidden p-2 bg-white border-b flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-semibold">Mailbox</span>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default MailBox;
