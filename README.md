# FAM Bottling Co - Frontend

A modern React + Vite application for PET bottle supply management.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Folder Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.jsx
│   ├── Card.jsx
│   └── Button.jsx
├── pages/            # Full page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── SupplyForm.jsx
│   ├── Dashboard.jsx
│   └── AdminDashboard.jsx
├── services/         # API integration
│   └── api.js        # Axios instances & service functions
├── styles/           # CSS files
│   ├── index.css
│   ├── Navbar.css
│   ├── App.css
│   ├── LandingPage.css
│   ├── AuthPages.css
│   ├── SupplyForm.css
│   ├── Dashboard.css
│   └── AdminDashboard.css
├── App.jsx           # Main app with routing
└── main.jsx          # Entry point
```

## 🎨 Pages

### Landing Page (`/`)
- Hero section with company branding
- Feature highlights
- Available bottle sizes
- Call-to-action buttons

### Authentication
- **Register** (`/register`) - New user signup
- **Login** (`/login`) - User authentication

### Supply Form (`/supply`)
- Bottle size selection (30cl - 1.5L)
- Quantity & price input
- Auto-calculated total and cashback preview
- Form validation

### User Dashboard (`/dashboard`)
- Statistics cards (supplies, revenue, cashback)
- Transaction history with filtering
- Status tracking (Pending/Approved/Paid)
- Quick access to submit new supplies

### Admin Dashboard (`/admin`)
- Overview of all supplies
- Supplier details
- Status update modal
- Returning customer toggle
- Real-time statistics

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Vite Config

`vite.config.js` includes:
- React plugin
- Dev server on port 3000
- API proxy to backend

## 🌐 API Integration

Located in `src/services/api.js`:

```javascript
// Auth
authService.register(name, email, password, passwordConfirm)
authService.login(email, password)
authService.getProfile()

// Supply
supplyService.submitSupply(bottleSize, quantity, pricePerUnit)
supplyService.getUserSupplies()
supplyService.getSupplyById(id)

// Admin
adminService.getAllSupplies()
adminService.updateSupplyStatus(id, status, notes)
adminService.toggleReturningCustomer(userId)
adminService.getUserDetails(userId)
```

### Request Interceptors

- Automatically adds JWT token from localStorage
- Proper Authorization headers
- Error handling

## 🎨 Design System

### Colors
- Primary: `#1e7145` (Forest Green)
- Secondary: `#0d7377` (Teal)
- Accent: `#14b8a6` (Turquoise)
- Light BG: `#f0f9ff` (Light Blue)

### Components

**Card**: Container with shadow and hover effects
**Button**: Primary, secondary, danger variants
**Navbar**: Sticky header with navigation
**Form**: Input validation and styling

## 🔐 Authentication

- JWT tokens stored in localStorage
- Automatic token attachment to requests
- Redirect unauthenticated users to login
- Admin-only route protection

## 📱 Responsive Design

- Mobile-first approach
- Grid & flexbox layouts
- Breakpoints at 768px
- Touch-friendly UI elements

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### Render
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🐛 Debugging

### Clear Cache
```bash
# Clear localStorage (in browser console)
localStorage.clear()

# Clear browser cache
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
```

### Check Network
- Open DevTools → Network tab
- Check API requests and responses
- Verify headers include Authorization

### Common Issues

**"Cannot find module" errors**
- Run `npm install` again
- Delete `node_modules` and reinstall

**API connection fails**
- Ensure backend is running on port 5000
- Check VITE_API_BASE_URL is correct
- Check browser console for errors

**Styles not loading**
- Clear browser cache
- Check CSS file paths
- Reload page with `Ctrl+Shift+R`

## 📚 Code Examples

### Making API Calls

In any component:
```javascript
import { supplyService } from '../services/api';

const handleSubmit = async () => {
  try {
    const response = await supplyService.submitSupply(
      bottleSize,
      quantity,
      pricePerUnit
    );
    setSuccess(response.data.message);
  } catch (err) {
    setError(err.response?.data?.message);
  }
};
```

### Using Protected Routes

```javascript
<Route 
  path="/supply" 
  element={user ? <SupplyForm /> : <Navigate to="/login" />} 
/>
```

## 🎯 Performance Tips

- Use React.memo for reusable components
- Implement code splitting for pages
- Lazy load images with placeholder
- Optimize CSS with critical CSS loading
- Use production build for testing

## 📖 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

Check the main [README.md](../README.md) for full project documentation.

---

**Built with React + Vite for FAM Bottling Co**
