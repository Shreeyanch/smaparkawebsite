// import { useState } from 'react';
// import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
// import PropTypes from 'prop-types';
// import styles from './share-your-travels-form.module.css';

// const ShareYourTravelsForm = ({ className = '' }) => {
//   const [Name, setName] = useState('');
//   const [PhoneNumber, setPhoneNumber] = useState('');
//   const [Product, setProduct] = useState('');
//   const [Description, setDescription] = useState('');
//   const [selectedProduct, setSelectedProduct] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = {
//       Name,
//       PhoneNumber,
//       Product,
//       Description,
//     };

//     // submit via api
//     const response = await fetch('/api/submit', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(form),
//     });

//     const content = await response.json();
//     alert('Your review has been submitted.');

//     setName('');
//     setPhoneNumber('');
//     setProduct('');
//     setDescription('');
//   };

//   return (
//     <div className={[styles.shareYourTravelsForm, className].join(' ')} data-scroll-to="shareYourTravelsForm">
//       <img className={styles.noMessagesIcon} alt="" src="/nomessages.svg" />
//       <div className={styles.formgetintouch}>
//         <div className={styles.formHeader}>
//           <div className={styles.formTitle}>Get In Touch</div>
//           <div className={styles.sendUsA}>
//             Send us a message about the product you're interested in, and we'll respond promptly.
//           </div>
//         </div>
//         <form className={styles.form} onSubmit={handleSubmit}>
//           <div className={styles.formFields}>
//             <div className={styles.nameInput}>
//               <TextField
//                 className={styles.input}
//                 color="primary"
//                 name="Name"
//                 label="Name"
//                 required={true}
//                 variant="outlined"
//                 value={Name}
//                 onChange={(e) => setName(e.target.value)}
//                 sx={{ '& .MuiInputBase-root': { height: '56px' } }}
//               />
//             </div>
//             <div className={styles.nameInput}>
//               <TextField
//                 className={styles.input}
//                 color="primary"
//                 name="PhoneNumber"
//                 label="Phone Number"
//                 size="medium"
//                 required={true}
//                 value={PhoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 variant="outlined"
//                 type="text"
//                 sx={{ '& .MuiInputBase-root': { height: '56px' } }}
//               />
//             </div>
//             <div className={styles.nameInput}>
//               <FormControl
//                 className={styles.input}
//                 variant="outlined"
//                 required={true}
//                 sx={{ '& .MuiInputBase-root': { height: '56px' } }}
//               >
//                 <InputLabel style={{ color: '#787672' }}>Products</InputLabel>
//                 <Select
//                   name="Product"
//                   label="Product"
//                   value={selectedProduct}
//                   onChange={(e) => setSelectedProduct(e.target.value)}
//                 >
//                   <MenuItem value="" disabled>
//                     Product
//                   </MenuItem>
//                   <MenuItem value="Loyalty Software">Loyalty Software</MenuItem>
//                   <MenuItem value="Filter Review Stand">Filter Review Stand</MenuItem>
//                   <MenuItem value="Direct Review">Direct Review</MenuItem>
//                   <MenuItem value="Smart Business Card">Smart Business Card</MenuItem>
//                 </Select>
//               </FormControl>
//             </div>
//             <div className={styles.nameInput}>
//               <TextField
//                 className={styles.input3}
//                 color="primary"
//                 name="Description"
//                 rows={4}
//                 value={Description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 label="Description"
//                 variant="outlined"
//                 multiline
//               />
//             </div>
//           </div>
//           <button type="submit" className={styles.formSubmitButton}>
//             <div className={styles.submit}>Submit</div>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// ShareYourTravelsForm.propTypes = {
//   className: PropTypes.string,
// };

// export default ShareYourTravelsForm;



import React, { useState } from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import styles from './share-your-travels-form.module.css';

const ShareYourTravelsForm = ({ className = '' }) => {
  const [Name, setName] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [Description, setDescription] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = {
      Name,
      PhoneNumber,
      Product: selectedProduct,  // Use selectedProduct here
      Description,
    };

    // submit via api
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const content = await response.json();
    alert('Your message has been submitted.');

    setName('');
    setPhoneNumber('');
    setSelectedProduct('');  // Reset selected product
    setDescription('');
  };

  return (
    <div className={[styles.shareYourTravelsForm, className].join(' ')} data-scroll-to="shareYourTravelsForm">
      <img className={styles.noMessagesIcon} alt="" src="/nomessages.svg" />
      <div className={styles.formgetintouch}>
        <div className={styles.formHeader}>
          <div className={styles.formTitle}>Get In Touch</div>
          <div className={styles.sendUsA}>
            Send us a message about the product you're interested in, and we'll respond promptly.
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.nameInput}>
              <TextField
                className={styles.input}
                color="primary"
                name="Name"
                label="Name"
                required={true}
                variant="outlined"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </div>
            <div className={styles.nameInput}>
              <TextField
                className={styles.input}
                color="primary"
                name="PhoneNumber"
                label="Phone Number"
                size="medium"
                required={true}
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="outlined"
                type="text"
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              />
            </div>
            <div className={styles.nameInput}>
              <FormControl
                className={styles.input}
                variant="outlined"
                required={true}
                sx={{ '& .MuiInputBase-root': { height: '56px' } }}
              >
                <InputLabel style={{ color: '#787672' }}>Products</InputLabel>
                <Select
                  name="Product"
                  label="Product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}  // Update selectedProduct state
                >
                  <MenuItem value="" disabled>
                    Product
                  </MenuItem>
                  <MenuItem value="Loyalty Software">Loyalty Software</MenuItem>
                  <MenuItem value="Filter Review Stand">Filter Review Stand</MenuItem>
                  <MenuItem value="Direct Review">Direct Review</MenuItem>
                  <MenuItem value="Smart Business Card">Smart Business Card</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={styles.nameInput}>
              <TextField
                className={styles.input3}
                color="primary"
                name="Description"
                rows={4}
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                label="Description"
                variant="outlined"
                multiline
              />
            </div>
          </div>
          <button type="submit" className={styles.formSubmitButton}>
            <div className={styles.submit}>Submit</div>
          </button>
        </form>
      </div>
    </div>
  );
};

ShareYourTravelsForm.propTypes = {
  className: PropTypes.string,
};

export default ShareYourTravelsForm;
