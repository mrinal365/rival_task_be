// should be set after authorise, bcz this needs req.user
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // authenticate middleware must run first
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                message: 'Access denied. Not authenticated.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 403,
                message: 'Forbidden. You do not have permission to access this resource.'
            });
        }

        next();
    };
};
