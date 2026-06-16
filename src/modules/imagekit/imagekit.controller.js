import crypto from 'crypto';
import { handleResponse } from '../../utils/index.js';

/**
 * Generate authentication parameters for ImageKit client-side uploads.
 * Calculated as HMAC-SHA1 of token + expire using the private key.
 */
export const getAuthParams = async (req, res, next) => {
    try {
        const token = req.query.token || crypto.randomUUID();
        const expire = parseInt(req.query.expire) || Math.floor(Date.now() / 1000) + 1800; // 30 minutes
        
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            const error = new Error("ImageKit private key is not configured on the server.");
            error.statusCode = 500;
            throw error;
        }

        const signature = crypto
            .createHmac('sha1', privateKey)
            .update(token + expire)
            .digest('hex');

        handleResponse(res, 200, "ImageKit auth parameters generated successfully", {
            token,
            expire,
            signature
        });
    } catch (err) {
        next(err);
    }
};
