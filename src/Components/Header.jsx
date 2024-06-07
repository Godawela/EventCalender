// Header.js
import React from 'react';
import './Header.css';
import {BsGrid1X2Fill}from 'react-icons/bs'

export default function Header() {
  return (
    <div>
      <div className="head">
      <a href="#" className='back'>
        <BsGrid1X2Fill className="icon"/> Dashboard
      </a>
      </div>
    </div>
  );
}