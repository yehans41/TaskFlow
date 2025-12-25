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
  workspaceId?: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');

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
    if (!newWorkspaceName.trim()) {
      alert('Please enter a workspace name');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/tasks/workspaces`, {
        name: newWorkspaceName,
        description: ''
      });
      setNewWorkspaceName('');
      setShowWorkspaceModal(false);
      fetchWorkspaces();
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      alert(`Failed to create workspace: ${error.response?.data?.error || error.message}`);
    }
  };

  const createBoard = async () => {
    if (!selectedWorkspace) return;

    if (!newBoardName.trim()) {
      alert('Please enter a board name');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/tasks/workspaces/${selectedWorkspace}/boards`, {
        name: newBoardName,
        description: ''
      });
      setNewBoardName('');
      setShowBoardModal(false);
      fetchBoards(selectedWorkspace);
    } catch (error: any) {
      console.error('Failed to create board:', error);
      alert(`Failed to create board: ${error.response?.data?.error || error.message}`);
    }
  };

  const openEditBoardModal = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the board
    setSelectedBoard(board);
    setEditBoardName(board.name);
    setEditBoardDescription(board.description);
    setShowEditBoardModal(true);
  };

  const updateBoard = async () => {
    if (!selectedBoard || !selectedWorkspace) return;

    try {
      await axios.put(`${API_URL}/api/tasks/boards/${selectedBoard.id}`, {
        name: editBoardName,
        description: editBoardDescription,
        workspaceId: selectedWorkspace
      });
      setShowEditBoardModal(false);
      setSelectedBoard(null);
      setEditBoardName('');
      setEditBoardDescription('');
      fetchBoards(selectedWorkspace);
    } catch (error: any) {
      console.error('Failed to update board:', error);
      alert(`Failed to update board: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteBoard = async (boardId: number) => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/tasks/boards/${boardId}`);
      if (selectedWorkspace) {
        fetchBoards(selectedWorkspace);
      }
    } catch (error: any) {
      console.error('Failed to delete board:', error);
      alert(`Failed to delete board: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteWorkspace = async (workspaceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace? All boards and data will be lost.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/tasks/workspaces/${workspaceId}`);
      fetchWorkspaces();
      if (selectedWorkspace === workspaceId) {
        setSelectedWorkspace(null);
        setBoards([]);
      }
    } catch (error: any) {
      console.error('Failed to delete workspace:', error);
      alert(`Failed to delete workspace: ${error.response?.data?.error || error.message}`);
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
                <span>{workspace.name}</span>
                <button
                  onClick={(e) => deleteWorkspace(workspace.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc3545',
                    padding: '2px 4px'
                  }}
                  title="Delete workspace"
                >
                  🗑️
                </button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3>{board.name}</h3>
                  <div>
                    <button
                      onClick={(e) => openEditBoardModal(board, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px 8px'
                      }}
                      title="Edit board"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(board.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px 8px',
                        color: '#dc3545'
                      }}
                      title="Delete board"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
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

      {showEditBoardModal && (
        <div className="modal-overlay" onClick={() => setShowEditBoardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Board</h3>
            <input
              type="text"
              placeholder="Board name"
              value={editBoardName}
              onChange={(e) => setEditBoardName(e.target.value)}
            />
            <textarea
              placeholder="Board description (optional)"
              value={editBoardDescription}
              onChange={(e) => setEditBoardDescription(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setShowEditBoardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={updateBoard}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
