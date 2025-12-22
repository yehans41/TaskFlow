import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000';

interface Workspace {
  id: number;
  name: string;
  description: string;
}

interface Board {
  id: number;
  name: string;
  description: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchBoards(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/workspaces`);
      setWorkspaces(response.data);
      if (response.data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  };

  const fetchBoards = async (workspaceId: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/workspaces/${workspaceId}/boards`);
      setBoards(response.data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const createWorkspace = async () => {
    try {
      await axios.post(`${API_URL}/api/tasks/workspaces`, {
        name: newWorkspaceName,
        description: ''
      });
      setNewWorkspaceName('');
      setShowWorkspaceModal(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const createBoard = async () => {
    if (!selectedWorkspace) return;
    try {
      await axios.post(`${API_URL}/api/tasks/workspaces/${selectedWorkspace}/boards`, {
        name: newBoardName,
        description: ''
      });
      setNewBoardName('');
      setShowBoardModal(false);
      fetchBoards(selectedWorkspace);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>TaskFlow</h1>
        <div className="navbar-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Workspaces</h3>
            <button onClick={() => setShowWorkspaceModal(true)}>+</button>
          </div>
          <div className="workspace-list">
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                className={`workspace-item ${selectedWorkspace === workspace.id ? 'active' : ''}`}
                onClick={() => setSelectedWorkspace(workspace.id)}
              >
                {workspace.name}
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="boards-header">
            <h2>Boards</h2>
            <button className="btn-primary" onClick={() => setShowBoardModal(true)}>
              Create Board
            </button>
          </div>
          <div className="boards-grid">
            {boards.map(board => (
              <div
                key={board.id}
                className="board-card"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <h3>{board.name}</h3>
                <p>{board.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWorkspaceModal && (
        <div className="modal-overlay" onClick={() => setShowWorkspaceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowWorkspaceModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createWorkspace}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showBoardModal && (
        <div className="modal-overlay" onClick={() => setShowBoardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Board</h3>
            <input
              type="text"
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowBoardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createBoard}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
