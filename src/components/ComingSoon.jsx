import React from 'react';

const ComingSoon = ({ title }) => {
  return (
    <div className="container-fluid p-0">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h2 className="text-center mb-0 py-3">{title}</h2>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="bg-light rounded p-4 mb-4 text-center">
            <div className="display-4 mb-3">📊</div>
            <p className="text-muted mb-0">Data visualization coming soon</p>
          </div>
          
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Average</h6>
                  <span className="h4">--</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Maximum</h6>
                  <span className="h4">--</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Minimum</h6>
                  <span className="h4">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 