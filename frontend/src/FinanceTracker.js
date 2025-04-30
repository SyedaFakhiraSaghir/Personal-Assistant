import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './FinanceTracker.module.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function FinanceTracker() {
  const navigate = useNavigate();
  const [income, setIncome] = useState(0); // Initialize as number
  const [expenses, setExpenses] = useState([]);
  const [remainingIncome, setRemainingIncome] = useState(0); // Initialize as number
  const [newIncome, setNewIncome] = useState({ amount: '', date: '' });
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', date: '' });
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract userId from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('userId');
    if (id) {
      setUserId(id);
    } else {
      setError('User ID is required');
    }
  }, []);

  const fetchIncome = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/income?userId=${userId}`);
      // Ensure we get a number value
      const incomeValue = Number(response.data?.income) || 0;
      setIncome(incomeValue);
    } catch (error) {
      console.error('Error fetching income:', error);
      setError('Failed to fetch income data');
      setIncome(0);
    }
  }, [userId]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/expenses?userId=${userId}`);
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses data');
      setExpenses([]);
    }
  }, [userId]);

  const fetchRemainingIncome = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/remaining-income?userId=${userId}`);
      // Ensure we get a number value
      const remainingValue = Number(response.data?.remainingIncome) || 0;
      setRemainingIncome(remainingValue);
    } catch (error) {
      console.error('Error fetching remaining income:', error);
      setError('Failed to fetch remaining income data');
      setRemainingIncome(0);
    }
  }, [userId]);

  // Fetch data when userId changes
  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([fetchIncome(), fetchExpenses(), fetchRemainingIncome()])
        .catch(err => console.error('Error fetching data:', err))
        .finally(() => setLoading(false));
    }
  }, [userId, fetchIncome, fetchExpenses, fetchRemainingIncome]);

  const handleAddIncome = async () => {
    if (!newIncome.amount || !newIncome.date) {
      setError('Amount and date are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:9000/api/income', {
        ...newIncome,
        amount: Number(newIncome.amount),
        userId: userId
      });
      setNewIncome({ amount: '', date: '' });
      await Promise.all([fetchIncome(), fetchRemainingIncome()]);
      setError('');
    } catch (error) {
      console.error('Error adding income:', error);
      setError('Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.date) {
      setError('Amount, category, and date are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:9000/api/expenses', {
        ...newExpense,
        amount: Number(newExpense.amount),
        userId: userId
      });
      setNewExpense({ amount: '', category: '', date: '' });
      await Promise.all([fetchExpenses(), fetchRemainingIncome()]);
      setError('');
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  const graphData = {
    labels: expenses.map(exp => exp.date),
    datasets: [
      {
        label: 'Expenses',
        data: expenses.map(exp => Number(exp.amount)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <>
      <div className="header">
  <a href="#default" className="logo">RAAS</a>
  <div className="header-right">
    <button className="btns" onClick={() => navigate(`/home`)}>Home</button>
  </div>
</div>
<div style={{ height: '700px' }} aria-hidden="true"></div>
      
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        {loading && <div className={styles.loading}>Loading...</div>}

        <div className={styles.appHeader}>
          <h1 className={styles.appTitle}>Finance Tracker</h1>
          <p className={styles.appSubtitle}>Track your income and expenses efficiently</p>
        </div>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Income</h2>
            <p>Total Income: ${formatCurrency(income)}</p>

            <div className={styles.formGroup}>
              <h3>Add Income</h3>
              <input
                className={styles.formInput}
                type="number" 
                placeholder="Amount" 
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} 
              />
              <input
                className={styles.formInput}
                type="date" 
                value={newIncome.date} 
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} 
              />
              <button 
                className={styles.button} 
                onClick={handleAddIncome}
                disabled={loading}
              >
                Add Income
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Remaining Income</h2>
            <p>Remaining Income: ${formatCurrency(remainingIncome)}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Expenses</h2>
            {expenses.length > 0 ? (
              <ul className={styles.list}>
                {expenses.map(exp => (
                  <li key={exp.id || `${exp.category}-${exp.date}-${exp.amount}`}>
                    {exp.category}: ${formatCurrency(exp.amount)} on {exp.date}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No expenses recorded</p>
            )}

            <div className={styles.formGroup}>
              <h3>Add Expense</h3>
              <input
                className={styles.formInput}
                type="number" 
                placeholder="Amount" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} 
              />
              <input
                className={styles.formInput}
                type="text" 
                placeholder="Category" 
                value={newExpense.category} 
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} 
              />
              <input
                className={styles.formInput}
                type="date" 
                value={newExpense.date} 
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} 
              />
              <button 
                className={styles.button} 
                onClick={handleAddExpense}
                disabled={loading}
              >
                Add Expense
              </button>
            </div>
          </section>

          {expenses.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Expenses Graph</h2>
              <div className={styles.graphContainer}>
                <Line data={graphData} />
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default FinanceTracker;