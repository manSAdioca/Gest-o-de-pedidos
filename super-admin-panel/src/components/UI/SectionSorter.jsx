import React, { useState, useEffect } from 'react';

const SectionSorter = ({ sectionOrder, onChange }) => {
  const defaultBlocks = [
    { id: 'hero', label: 'Capa Principal' },
    { id: 'categories', label: 'Categorias' },
    { id: 'products', label: 'Produtos' },
    { id: 'about', label: 'Sobre Nós' },
    { id: 'contact', label: 'Contato' }
  ];

  const currentOrder = sectionOrder ? sectionOrder.split(',').map(s => s.trim()) : ['hero','categories','products','about','contact'];
  const items = currentOrder.map(id => defaultBlocks.find(b => b.id === id) || { id, label: id });
  defaultBlocks.forEach(b => { if (!currentOrder.includes(b.id)) items.push(b); });

  const [list, setList] = useState(items);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    // Sincroniza estado interno caso mude por fora
    const extOrder = sectionOrder ? sectionOrder.split(',').map(s => s.trim()) : ['hero','categories','products','about','contact'];
    const newItems = extOrder.map(id => defaultBlocks.find(b => b.id === id) || { id, label: id });
    defaultBlocks.forEach(b => { if (!extOrder.includes(b.id)) newItems.push(b); });
    setList(newItems);
  }, [sectionOrder]);

  const onDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if(e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(e.target, 20, 20);
    }
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...list];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setList(newList);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    onChange(list.map(item => item.id).join(','));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
      {list.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
          style={{
            padding: '12px 16px',
            backgroundColor: draggedIndex === index ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: draggedIndex === index ? '#fff' : 'inherit',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
            boxShadow: draggedIndex === index ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          <span style={{ cursor: 'grab', opacity: 0.5, fontSize: '18px' }}>≡</span> {item.label}
        </div>
      ))}
    </div>
  );
};

export default SectionSorter;
