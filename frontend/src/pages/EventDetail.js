import React from 'react';
import { Outlet } from 'react-router-dom';

const EventDetail = () => {
  return (
    <div>
      <h1>Event Detail Page</h1>
      <Outlet />
    </div>
  );
};

export default EventDetail;