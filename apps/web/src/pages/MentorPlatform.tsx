import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Users2, Calendar, MessageSquare, Send, Award, Video, VideoOff } from 'lucide-react';

interface Mentor {
  _id: string;
  userId: { _id: string; name: string; email: string };
  specialties: string[];
  rating: number;
  availability: string[];
}

export const MentorPlatform: React.FC = () => {
  const { user } = useAuth();
  const { joinRoom, sendMessage, socket } = useSocket();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatRoomId, setChatRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ senderName: string; text: string; timestamp: Date }[]>([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await ApiClient.request('/mentor/list');
        setMentors(response.mentors || []);
        if (response.mentors && response.mentors.length > 0) {
          setSelectedMentor(response.mentors[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  // Listen to incoming sockets messages
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (data: any) => {
      setChatMessages((prev) => [...prev, {
        senderName: data.senderName,
        text: data.text,
        timestamp: new Date(data.timestamp),
      }]);
    };

    socket.on('messageReceived', handleMsg);

    return () => {
      socket.off('messageReceived', handleMsg);
    };
  }, [socket]);

  const selectMentorForChat = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    const room = `room-${user?.id}-${mentor.userId._id}`;
    setChatRoomId(room);
    setChatMessages([]);
    joinRoom(room);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatRoomId || !user) return;
    sendMessage(chatRoomId, user.name, message.trim());
    setMessage('');
  };

  const handleBook = async (slot: string) => {
    if (!selectedMentor) return;
    try {
      await ApiClient.request('/mentor/book', {
        method: 'POST',
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          slot,
        }),
      });
      alert('Session Booked Successfully! Your calendar slot is locked.');
      // Refresh list
      const response = await ApiClient.request('/mentor/list');
      setMentors(response.mentors || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-140px)]">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mentor & Peer Collaboration</h1>
        <p className="text-slate-400 text-sm">Schedule slots with industry specialists, join collaborative mock rooms, and ask reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Mentor Directory */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400">
              <Users2 className="h-4 w-4" />
              <span>Available Mentors</span>
            </h3>

            {loading ? (
              <p className="text-xs text-slate-500 animate-pulse">Scanning advisors directory...</p>
            ) : mentors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No registered mentors in directory currently.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {mentors.map((mentor) => (
                  <button
                    key={mentor._id}
                    onClick={() => selectMentorForChat(mentor)}
                    className={`text-left p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                      selectedMentor?._id === mentor._id
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-sm text-slate-200">{mentor.userId.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">★ {mentor.rating} Rating</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {mentor.specialties.map((spec, sIdx) => (
                        <span key={sIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Dynamic Booking & Chat Interface */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          {selectedMentor ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
              {/* Slots Calendar */}
              <Card hoverable={false} className="flex flex-col gap-4 overflow-y-auto pr-2">
                <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-400">
                  <Calendar className="h-4 w-4" />
                  <span>Book Consultation Session</span>
                </h3>

                <div className="flex flex-col gap-2.5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Available Slot</p>
                  
                  {/* Static mock calendar slots */}
                  {['2026-06-01T10:00:00Z', '2026-06-02T15:00:00Z', '2026-06-03T18:00:00Z'].map((slot, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                      <span>{new Date(slot).toLocaleDateString()} at {new Date(slot).toLocaleTimeString()}</span>
                      <Button onClick={() => handleBook(slot)} className="px-3 py-1.5 text-[10px]">
                        Book Call
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Socket.io Chat Panel */}
              <Card hoverable={false} className="flex flex-col p-4 h-full overflow-hidden">
                <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400 mb-2 border-b border-white/10 pb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Consult with {selectedMentor.userId.name}</span>
                </h3>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 mb-4 scroll-smooth">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 italic text-[11px] gap-2">
                      <Video className="h-8 w-8 text-slate-800" />
                      <span>Select a mentor from directory to start a collaborative messaging room.</span>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-0.5 max-w-[80%] ${
                          msg.senderName === user?.name ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-slate-500">{msg.senderName}</span>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                            msg.senderName === user?.name
                              ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                              : 'bg-slate-900/60 border-white/5 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                  <Input
                    placeholder="Type collaboration message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!chatRoomId}
                    className="flex-1 py-2 text-xs"
                  />
                  <Button type="submit" disabled={!chatRoomId || !message.trim()} className="px-4 py-2">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </Card>
            </div>
          ) : (
            <Card hoverable={false} className="flex flex-col items-center justify-center p-12 text-slate-500 border-dashed border-slate-800 h-full">
              <Users2 className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-sm">Select an advisor from the directory to request mock reviews or consult.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default MentorPlatform;
