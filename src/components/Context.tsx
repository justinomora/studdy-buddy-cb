import { useEffect, useState } from 'react';
import type { StudyMaterial } from '../types/chat';
import { getMaterials } from '../services/api';
import './Context.css';

export function Context() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data.topics || []);
      if (data.topics && data.topics.length > 0) {
        setSelectedTopic(data.topics[0].id);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = materials.find(m => m.id === selectedTopic);

  if (loading) {
    return <div className="context-container">Loading study materials...</div>;
  }

  return (
    <div className="context-container">
      <h3>Study Materials</h3>
      
      <div className="topic-tabs">
        {materials.map(material => (
          <button
            key={material.id}
            className={`topic-tab ${selectedTopic === material.id ? 'active' : ''}`}
            onClick={() => setSelectedTopic(material.id)}
          >
            {material.title}
          </button>
        ))}
      </div>

      {selectedMaterial && (
        <div className="material-content">
          <h4>{selectedMaterial.title}</h4>
          <div className="material-category">{selectedMaterial.category}</div>
          
          <div className="material-section">
            <h5>Overview</h5>
            <p>{selectedMaterial.content.substring(0, 300)}...</p>
          </div>

          <div className="material-section">
            <h5>Key Concepts</h5>
            <ul>
              {selectedMaterial.key_concepts.map((concept, index) => (
                <li key={index}>{concept}</li>
              ))}
            </ul>
          </div>

          <div className="material-section">
            <h5>Study Questions</h5>
            <ul>
              {selectedMaterial.study_questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>

          <div className="context-info">
            <small>This context will be used to answer your questions</small>
          </div>
        </div>
      )}
    </div>
  );
}