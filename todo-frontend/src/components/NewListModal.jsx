import React, { useEffect, useState } from 'react';

// Bootstrap 3 modal markup driven purely by React state: the parent renders it
// only while open, so there is no jQuery and no data-toggle plumbing.
export default function NewListModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#337ab7');

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onCreate({ name, color });
  };

  return (
    <>
      <div
        className="modal fade in"
        id="newListModal"
        role="dialog"
        tabIndex={-1}
        style={{ display: 'block' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <button type="button" className="close" aria-label="Close" onClick={onClose}>
                  &times;
                </button>
                <h4 className="modal-title">New list</h4>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="new-list-name">Name</label>
                  <input
                    id="new-list-name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-list-color">Color</label>
                  <input
                    id="new-list-color"
                    type="color"
                    className="form-control"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade in" onClick={onClose} />
    </>
  );
}
