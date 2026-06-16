export const ROLES = Object.freeze({
    USER: 'user',
    ADMIN: 'admin',
    // MANAGER: 'manager',  
    // MODERATOR: 'moderator',
});

// All roles as an array
export const ALL_ROLES = Object.values(ROLES);

// Default role assigned to new users
export const DEFAULT_ROLE = ROLES.USER;
