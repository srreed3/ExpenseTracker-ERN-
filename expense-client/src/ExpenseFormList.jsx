import { useEffect, useState } from 'react'
import ExpenseChart from './ExpenseChart'

function ExpenseFormList() {

  const [expenses, setExpenses] = useState([])
  const [expenseDate, setExpenseDate] = useState('')
  const [expenseType, setExpenseType] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [totalExpenses, setTotalExpenses] = useState(0);

  //format date correctly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  //fetch expenses from http://localhost:8080/expenses
  const fetchExpenses = async () => {
    const expensesUrl = 'http://localhost:8080/expenses'
    const response = await fetch(expensesUrl)
    const result = await response.json()
    const formattedExpenses = result.map(expense => ({
      ...expense,
      date: formatDate(expense.date)
    }));
    setExpenses(formattedExpenses)
    calculateTotalExpenses(formattedExpenses)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])       //passing []: useEffect called once; no dependencies

  //sort expenses by date
  const sortedExpenses = [...expenses].sort((b, a) => new Date(a.date) - new Date(b.date));

  const expenseItems = sortedExpenses.map((expense) => {
    return  <tr key={expense._id}>
              <td>{expense.date}</td>
              <td>{expense.type}</td>
              <td>{expense.amount}</td>
              <td>{expense.description}</td>
              <td><button onClick={() => handleRemoveExpense(expense._id)}>X</button></td>
            </tr>
  })

  const handleAddExpense = async (e) => {

    //prevent pg from refreshing
    e.preventDefault()

    //send async request to server
    await saveExpense()

    //reset values when user submits 
    setExpenseDate('');
    setExpenseType('');
    setExpenseAmount('');
    setExpenseDescription('');

  }

  const saveExpense = async () => {
    const expensesUrl = 'http://localhost:8080/expenses'

    const response = await fetch(expensesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: expenseDate, 
        type: expenseType, 
        amount: parseFloat(expenseAmount), 
        description: expenseDescription || 'N/A'
      })
    })

    const expense = await response.json()
    expense.date = formatDate(expense.date)

    //add expense to expense array
    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);
    calculateTotalExpenses(newExpenses);
  }

  //remove single expense
  const handleRemoveExpense = async (id) => {
    const expensesUrl = `http://localhost:8080/expense/${id}`;
    await fetch(expensesUrl, { method: 'DELETE' });
  
    const newExpenses = expenses.filter((expense) => expense._id !== id);
    setExpenses(newExpenses);
    calculateTotalExpenses(newExpenses);
  }

  //remove all expenses
  const handleClearAllExpenses = async () => {
    const expensesUrl = 'http://localhost:8080/expenses';
    await fetch(expensesUrl, { method: 'DELETE' });
    setExpenses([]);
    setTotalExpenses(0);
  }

  const handleDateChange = (e) => {
    setExpenseDate(e.target.value)
  }

  const handleTypeChange = (e) => {
    setExpenseType(e.target.value)
  }

  const handleAmountChange = (e) => {
    setExpenseAmount(parseFloat(e.target.value))
  }

  const handleDescriptionChange = (e) => {
    setExpenseDescription(e.target.value)
  }

  //calculate total expenses
  const calculateTotalExpenses = (expensesList) => {
    const total = expensesList.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total.toFixed(2))
  };
  //hide scroll bar
  document.body.style.overflow = 'hidden';

  return (
    <>
    <div className="cards">
     <div className="card1">
        <div className="addExpenses">
          <h2>Add Expenses</h2>
              <form id="formContainer" className="formContainer">
                  <label htmlFor="dateExpense">Date of Expense:</label>
                  <input type="date" id="dateExpense" name="dateExpense" value={expenseDate} onChange={handleDateChange} required/><br/>

                  <label htmlFor="typeExpense">Type of Expense:</label>
                  <select id="typeExpense" name="typeExpense" size="4" value={expenseType} onChange={handleTypeChange} required>
                      <option id="rent" value = "Rent">Rent</option>
                      <option id="utilities" value = "Utilities">Utilities</option>
                      <option id="groceries" value = "Groceries">Groceries</option>
                      <option id="gas" value = "Gas">Gas</option>
                      <option id="phone" value = "Phone">Phone</option>                    
                      <option id="loans" value = "Loans">Loans</option>
                      <option id="insurance" value = "Insurance">Insurance</option>
                      <option id="entertainment" value = "Entertainment">Entertainment</option>
                      <option id="other" value = "Other">Other</option>
                  </select><br/>


                  <label htmlFor="numAmount">Amount ($):</label>
                  <input type="number" id="numAmount" name="numAmount" min="0"
                        value={expenseAmount} onChange={handleAmountChange} required/><br/>

                  <label>List a Description:</label>
                  <textarea id="description" name="description" placeholder="Write description here (optional)" 
                            rows="3" cols="35" maxLength="100" value={expenseDescription} onChange={handleDescriptionChange}></textarea><br/>
                  <div className="subButton">
                      <button id="submit" type="submit" onClick={handleAddExpense}>SUBMIT</button>
                  </div>
              </form>
              <div className='totalContainer'>
                  <h2>Total: ${totalExpenses}</h2>
                  <div className="clearButton">
                      <button onClick={() => handleClearAllExpenses()}>CLEAR ALL EXPENSES</button>
                  </div>
              </div>
        </div>
      </div>

      <div className="card2">
        <div className="viewExpenses">
            <div id="output" className="scrollable">    
                <h2 className="viewExpensesHeader">View Expenses</h2> 
                <table id="expenseTable">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>TYPE</th>
                            <th>AMOUNT ($)</th>
                            <th>DESCRIPTION</th>
                            <th>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                          {expenseItems}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
    <ExpenseChart expenses={expenses} />
    </>
  )
}

export default ExpenseFormList