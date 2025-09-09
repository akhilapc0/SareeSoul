const Address = require('../../models/addressModel');
const addressValidation = require('../../validator/schema'); 


const addAddress = async (req, res) => {
  try {
    
    const { error, value } = addressValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    
    const address = new Address({
      ...value,            
      userId: req.session.user._id   
    });

    await address.save();

    res.status(200).json({ success: true, message: 'address added', address });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports = { addAddress };
