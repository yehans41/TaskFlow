import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Board.css';

const API_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000';

interface Card {
  id: number;
  title: string;
  description: string;
  position: number;
}

interface List {
  id: number;
  name: string;
  position: number;
  cards: Card[];
}

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [lists, setLists] = useState<List[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');

  useEffect(() => {
    fetchBoard();
    fetchLists();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/boards/${id}`);
      setBoardName(response.data.name);
      setBoardDescription(response.data.description || '');
    } catch (error) {
      console.error('Failed to fetch board:', error);
    }
  };

  const openEditBoardModal = () => {
    setEditBoardName(boardName);
    setEditBoardDescription(boardDescription);
    setShowEditBoardModal(true);
  };

  const updateBoard = async () => {
    try {
      await axios.put(`${API_URL}/api/tasks/boards/${id}`, {
        name: editBoardName,
        description: editBoardDescription
      });
      setShowEditBoardModal(false);
      fetchBoard();
    } catch (error: any) {
      console.error('Failed to update board:', error);
      alert(`Failed to update board: ${error.response?.data?.error || error.message}`);
    }
  };

  const openEditCardModal = (card: Card) => {
    setSelectedCard(card);
    setNewCardTitle(card.title);
    setNewCardDescription(card.description);
    setShowEditCardModal(true);
  };

  const updateCard = async () => {
    if (!selectedCard) return;
    try {
      // Find the list that contains this card to get the listId
      const list = lists.find(l => l.cards.some(c => c.id === selectedCard.id));
      if (!list) {
        alert('Could not find the list for this card');
        return;
      }

      await axios.put(`${API_URL}/api/tasks/cards/${selectedCard.id}`, {
        title: newCardTitle,
        description: newCardDescription,
        position: selectedCard.position,
        listId: list.id,
        priority: 'medium'
      });
      setShowEditCardModal(false);
      setSelectedCard(null);
      setNewCardTitle('');
      setNewCardDescription('');
      fetchLists();
    } catch (error: any) {
      console.error('Failed to update card:', error);
      alert(`Failed to update card: ${error.response?.data?.error || error.message}`);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/boards/${id}/lists`);
      const listsData = await Promise.all(
        response.data.map(async (list: List) => {
          const cardsResponse = await axios.get(`${API_URL}/api/tasks/lists/${list.id}/cards`);
          return { ...list, cards: cardsResponse.data };
        })
      );
      setLists(listsData);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    }
  };

  const createList = async () => {
    try {
      await axios.post(`${API_URL}/api/tasks/boards/${id}/lists`, {
        name: newListName,
        position: lists.length
      });
      setNewListName('');
      setShowListModal(false);
      fetchLists();
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const createCard = async () => {
    if (!selectedListId) return;
    try {
      const list = lists.find(l => l.id === selectedListId);
      await axios.post(`${API_URL}/api/tasks/lists/${selectedListId}/cards`, {
        title: newCardTitle,
        description: newCardDescription,
        position: list?.cards.length || 0,
        priority: 'medium'
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setShowCardModal(false);
      setSelectedListId(null);
      fetchLists();
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  const openCardModal = (listId: number) => {
    setSelectedListId(listId);
    setShowCardModal(true);
  };

  const deleteList = async (listId: number) => {
    if (!window.confirm('Are you sure you want to delete this list? All cards will be lost.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/tasks/lists/${listId}`);
      fetchLists();
    } catch (error: any) {
      console.error('Failed to delete list:', error);
      alert(`Failed to delete list: ${error.response?.data?.error || error.message}`);
    }
  };

  const deleteCard = async (cardId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/tasks/cards/${cardId}`);
      fetchLists();
    } catch (error: any) {
      console.error('Failed to delete card:', error);
      alert(`Failed to delete card: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="board-page">
      <nav className="navbar">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/')}>← Back</button>
          <h1 onClick={openEditBoardModal} style={{ cursor: 'pointer' }} title="Click to edit">{boardName}</h1>
        </div>
      </nav>

      <div className="board-content">
        <div className="lists-container">
          {lists.map(list => (
            <div key={list.id} className="list">
              <div className="list-header">
                <h3>{list.name}</h3>
                <button
                  onClick={() => deleteList(list.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc3545',
                    padding: '2px 4px'
                  }}
                  title="Delete list"
                >
                  🗑️
                </button>
              </div>
              <div className="cards-container">
                {list.cards.map(card => (
                  <div key={card.id} className="card" onClick={() => openEditCardModal(card)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4>{card.title}</h4>
                        {card.description && <p>{card.description}</p>}
                      </div>
                      <button
                        onClick={(e) => deleteCard(card.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#dc3545',
                          padding: '2px 4px'
                        }}
                        title="Delete card"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                <button className="add-card-btn" onClick={() => openCardModal(list.id)}>
                  + Add a card
                </button>
              </div>
            </div>
          ))}
          <div className="add-list">
            <button onClick={() => setShowListModal(true)}>+ Add a list</button>
          </div>
        </div>
      </div>

      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create List</h3>
            <input
              type="text"
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowListModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createList}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Card</h3>
            <input
              type="text"
              placeholder="Card title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
            <textarea
              placeholder="Card description"
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setShowCardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createCard}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showEditCardModal && (
        <div className="modal-overlay" onClick={() => setShowEditCardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Card</h3>
            <input
              type="text"
              placeholder="Card title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
            <textarea
              placeholder="Card description"
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setShowEditCardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={updateCard}>Save</button>
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

export default Board;
