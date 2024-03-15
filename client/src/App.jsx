import React, { useState, useEffect } from 'react';

// Login component
const Login = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (ev) => {
    ev.preventDefault();
    await login({ username, password });
  };

  return (
    <form onSubmit={submit}>
      <input value={username} placeholder='username' onChange={(ev) => setUsername(ev.target.value)} />
      <input value={password} placeholder='password' onChange={(ev) => setPassword(ev.target.value)} />
      <button disabled={!username || !password}>Login</button>
    </form>
  );
};

// App component
function App() {
  const [auth, setAuth] = useState({});
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    attemptLoginWithToken();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const json = await response.json();
      setProducts(json);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (auth.id) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [auth.id]);

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem('token');
    if (token) {
      const response = await fetch(`/api/auth/me`, {
        headers: {
          authorization: token,
        },
      });
      if (response.ok) {
        const json = await response.json();
        setAuth(json);
      } else {
        window.localStorage.removeItem('token');
      }
    }
  };

  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const json = await response.json();
      window.localStorage.setItem('token', json.token);
      attemptLoginWithToken();
    } else {
      const json = await response.json();
      console.error(json);
    }
  };

  const addFavorite = async (product_id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ product_id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const json = await response.json();
      setFavorites([...favorites, json]);
    } else {
      const json = await response.json();
      console.error(json);
    }
  };

  const removeFavorite = async (id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setFavorites(favorites.filter((favorite) => favorite.id !== id));
    } else {
      const json = await response.json();
      console.error(json);
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    setAuth({});
  };

  return (
    <>
      {!auth.id ? <Login login={login} /> : <button onClick={logout}>Logout {auth.username}</button>}
      <ul>
        {products.map((product) => {
          const isFavorite = favorites.find((favorite) => favorite.product_id === product.id);
          return (
            <li key={product.id} className={isFavorite ? 'favorite' : ''}>
              {product.name}
              {auth.id && isFavorite && <button onClick={() => removeFavorite(isFavorite.id)}>-</button>}
              {auth.id && !isFavorite && <button onClick={() => addFavorite(product.id)}>+</button>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default App;