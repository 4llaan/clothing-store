import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'

const Shop = () => {

  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);

  const fetchInfo = () => { 
    fetch('http://localhost:4000/popularinwomen') 
      .then((res) => res.json()) 
      .then((data) => {
        // Ensure backward compatibility
        const processedData = data.map(item => ({
          ...item,
          images: item.images || [item.image] // Convert single image to array if needed
        }));
        setPopular(processedData);
      });

    fetch('http://localhost:4000/newcollections') 
      .then((res) => res.json()) 
      .then((data) => {
        const processedData = data.map(item => ({
          ...item,
          images: item.images || [item.image]
        }));
        setNewCollection(processedData);
      });
  }

  useEffect(() => {
    fetchInfo();
  }, [])


  return (
    <div>
      <Hero/>
      <Popular data={popular}/>
      <Offers/>
      <NewCollections data={newcollection}/>
      <NewsLetter/>
    </div>
  )
}

export default Shop
