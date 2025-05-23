
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    user: { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c719?w=32&h=32&fit=crop&crop=face' },
    lastMessage: 'Thanks for the fresh tomatoes! They were perfect for my salad.',
    timestamp: '5 min ago',
    unread: 2,
    isOnline: true
  },
  {
    id: '2',
    user: { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    lastMessage: 'Is the bread still available? I can pick it up this evening.',
    timestamp: '1 hour ago',
    unread: 0,
    isOnline: false
  },
  {
    id: '3',
    user: { name: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
    lastMessage: 'The apple pie was amazing! Thank you so much 😊',
    timestamp: '2 hours ago',
    unread: 1,
    isOnline: true
  }
];

const mockMessages = [
  { id: '1', text: 'Hi! I saw your post about the fresh tomatoes. Are they still available?', sender: 'other', timestamp: '10:30 AM' },
  { id: '2', text: 'Yes, they are! I have about 2 pounds of fresh organic tomatoes from my garden.', sender: 'me', timestamp: '10:32 AM' },
  { id: '3', text: 'Perfect! What time would be good for pickup?', sender: 'other', timestamp: '10:33 AM' },
  { id: '4', text: 'I\'m free anytime after 3 PM today. My address is 123 Garden St.', sender: 'me', timestamp: '10:35 AM' },
  { id: '5', text: 'Great! I\'ll come by around 4 PM. Thanks so much!', sender: 'other', timestamp: '10:36 AM' },
  { id: '6', text: 'Thanks for the fresh tomatoes! They were perfect for my salad.', sender: 'other', timestamp: '6:45 PM' }
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
            {/* Conversations List */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg p-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-full">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedConversation.id === conversation.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.user.avatar}
                          alt={conversation.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conversation.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.user.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg p-0 overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.user.avatar}
                      alt={selectedConversation.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedConversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedConversation.user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversation.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mockMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'me'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'me' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
