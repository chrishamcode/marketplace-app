import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, TextField, CircularProgress, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText, Badge, IconButton, Tabs, Tab } from '@mui/material';
import { Send, Refresh, ArrowBack, MoreVert, AttachFile, InsertPhoto } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ConversationComponent = ({ conversation, onSendMessage, isLoading }) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = React.useRef(null);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };
  
  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography variant="body1" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Box>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Conversation header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
        <Avatar src={conversation.otherUser.image} alt={conversation.otherUser.name} />
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Typography variant="subtitle1">{conversation.otherUser.name}</Typography>
          {conversation.listing && (
            <Typography variant="body2" color="text.secondary">
              Re: {conversation.listing.title}
            </Typography>
          )}
        </Box>
        <IconButton>
          <MoreVert />
        </IconButton>
      </Box>
      
      {/* Messages area */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', maxHeight: '400px' }}>
        {conversation.messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isFromCurrentUser ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            {!message.isFromCurrentUser && (
              <Avatar
                src={conversation.otherUser.image}
                alt={conversation.otherUser.name}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
            )}
            <Box
              sx={{
                maxWidth: '70%',
                p: 2,
                borderRadius: 2,
                backgroundColor: message.isFromCurrentUser ? '#1976d2' : '#f5f5f5',
                color: message.isFromCurrentUser ? 'white' : 'inherit',
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {message.isFromCurrentUser && (
                  <span style={{ marginLeft: '8px' }}>
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" sx={{ mr: 1 }}>
              <AttachFile />
            </IconButton>
            <IconButton size="small" sx={{ mr: 1 }}>
              <InsertPhoto />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading || !messageText.trim()}
              sx={{ minWidth: 'auto', width: 40, height: 40, p: 0 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : <Send />}
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

const ConversationListComponent = ({ conversations, selectedConversationId, onSelectConversation, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No conversations yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Start messaging sellers by viewing listings and clicking "Message Seller"
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {conversations.map((conversation) => (
        <ListItem
          key={conversation.id}
          alignItems="flex-start"
          button
          selected={selectedConversationId === conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          sx={{
            borderLeft: selectedConversationId === conversation.id ? '4px solid #1976d2' : 'none',
            bgcolor: selectedConversationId === conversation.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
          }}
        >
          <ListItemAvatar>
            <Badge
              color="primary"
              variant="dot"
              invisible={!conversation.hasUnreadMessages}
            >
              <Avatar src={conversation.otherUser.image} alt={conversation.otherUser.name} />
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={conversation.otherUser.name}
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{
                    display: 'inline',
                    fontWeight: conversation.hasUnreadMessages ? 'bold' : 'normal',
                  }}
                >
                  {conversation.lastMessage.isFromCurrentUser ? 'You: ' : ''}
                  {conversation.lastMessage.content.length > 30
                    ? conversation.lastMessage.content.substring(0, 30) + '...'
                    : conversation.lastMessage.content}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                </Typography>
                {conversation.listing && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    Re: {conversation.listing.title}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

const MessagingSystem = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const router = useRouter();
  
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      
      try {
        const response = await fetch('/api/messages/conversations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        setConversations(data.conversations);
        
        // Select first conversation if none selected
        if (data.conversations.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data.conversations[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    
    fetchConversations();
  }, []);
  
  // Handle conversation selection
  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    
    // Mark conversation as read
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, hasUnreadMessages: false }
          : conv
      )
    );
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle send message
  const handleSendMessage = async (messageText) => {
    if (!selectedConversationId) return;
    
    setIsSendingMessage(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content: messageText,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Update conversations with new message
      setConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv.id === selectedConversationId) {
            const newMessage = {
              id: data.message.id,
              content: messageText,
              timestamp: new Date().toISOString(),
              isFromCurrentUser: true,
              isRead: false,
            };
            
            return {
              ...conv,
              lastMessage: newMessage,
              messages: [...(conv.messages || []), newMessage],
            };
          }
          return conv;
        })
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  // Get selected conversation
  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Messages
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Messages" />
            <Tab label="Unread" />
            <Tab label="Archived" />
          </Tabs>
        </Paper>
        
        <Grid container spacing={3}>
          {/* Conversations list */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ height: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Conversations</Typography>
                <IconButton onClick={() => window.location.reload()}>
                  <Refresh />
                </IconButton>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <ConversationListComponent
                  conversations={conversations.filter(conv => {
                    if (activeTab === 0) return true;
                    if (activeTab === 1) return conv.hasUnreadMessages;
                    if (activeTab === 2) return conv.isArchived;
                    return true;
                  })}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={handleSelectConversation}
                  isLoading={isLoadingConversations}
                />
              </Box>
            </Paper>
          </Grid>
          
          {/* Conversation */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: '600px' }}>
              <ConversationComponent
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MessagingSystem;
