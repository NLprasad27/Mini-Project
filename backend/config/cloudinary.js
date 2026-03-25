const cloudinary = require('cloudinary').v2;

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME || 'mockcloudname',
        api_key: process.env.CLOUDINARY_API_KEY || 'mockapikey',
        api_secret: process.env.CLOUDINARY_SECRET_KEY || 'mockapisecret'
    });
};

module.exports = connectCloudinary;
