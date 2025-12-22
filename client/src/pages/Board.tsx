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
  const [lists, setLists] = useState<List[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  useEffect(() => {
    fetchBoard();
    fetchLists();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/boards/${id}`);
      setBoardName(response.data.name);
    } catch (error) {
      console.error('Failed to fetch board:', error);
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

  return (
    <div className="board-page">
      <nav className="navbar">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/')}>← Back</button>
          <h1>{boardName}</h1>
        </div>
      </nav>

      <div className="board-content">
        <div className="lists-container">
          {lists.map(list => (
            <div key={list.id} className="list">
              <div className="list-header">
                <h3>{list.name}</h3>
              </div>
              <div className="cards-container">
                {list.cards.map(card => (
                  <div key={card.id} className="card">
                    <h4>{card.title}</h4>
                    {card.description && <p>{card.description}</p>}
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
    </div>
  );
};

export default Board;
