const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const Joi = require('joi')

// list of transactions sorted by timestamp
let transactions = []
// total user points available
let availablePoints = 0
// payer points balance
let payerPointsBalance = {}
// error message
const errorMsg = { message: 'Error: Invalid Operation' }

app.use(express.json())

// add transactions for specific payer and date
app.post('/transactions', (req, res) => {
  // validate add transaction
  const transactionSchema = Joi.object({
    payer: Joi.string().uppercase().required(),
    points: Joi.number().integer().required(),
    timestamp: Joi.date().iso().required(),
  })
  const { error } = transactionSchema.validate(req.body)

  if (!error) {
    const { payer, points } = req.body

    // check if transaction sends a valid number of points e.g. not zero, payer points not negative after operation
    if (points === 0) {
      res.status(422).json(errorMsg)
    } else if (
      (!(payer in payerPointsBalance) && points < 0) ||
      payerPointsBalance[payer] + points < 0
    ) {
      res.status(422).json(errorMsg)
    } else {
      // check if payer is already in payerPointsBalance
      if (!(payer in payerPointsBalance)) {
        payerPointsBalance[payer] = points
      } else {
        // if payer is already in payerPointsBalance, update payer's points
        payerPointsBalance[payer] += points
      }

      // update total user points available
      availablePoints += points

      // add transaction to transactions array
      transactions.push(req.body)

      // sort transactions array by timestamp
      transactions.sort((a, b) => {
        return a.timestamp < b.timestamp
          ? -1
          : a.timestamp > b.timestamp
          ? 1
          : 0
      })

      res.status(200).json({ message: 'successfully added transaction' })
    }
  } else {
    res.status(422).json(errorMsg)
  }
})

// spend points and return a list of spent payer points for each call
app.post('/spend', (req, res) => {
  // validate spend transaction
  const spendSchema = Joi.object({
    points: Joi.number().integer().greater(0).max(availablePoints).required(),
  })
  const { error } = spendSchema.validate(req.body)

  if (!error) {
    const { points } = req.body

    // update available points
    availablePoints -= points

    let pointsToSpend = points
    // get the spent transactions for return response
    let spentTransactions = {}

    while (pointsToSpend > 0) {
      // get the oldest transaction
      let transaction = transactions.shift()

      // check if the points from this transaction can be applied in full or not
      if (transaction.points < pointsToSpend) {
        if (spentTransactions[transaction.payer]) {
          spentTransactions[transaction.payer] -= transaction.points
        } else {
          spentTransactions[transaction.payer] = -Math.abs(transaction.points)
        }

        pointsToSpend -= transaction.points
        payerPointsBalance[transaction.payer] -= transaction.points
      } else {
        let leftoverPoints = transaction.points - pointsToSpend

        if (spentTransactions[transaction.payer]) {
          spentTransactions[transaction.payer] -= transaction.points
        } else {
          spentTransactions[transaction.payer] = -Math.abs(
            transaction.points - leftoverPoints
          )
        }

        // update the payerPointsBalance
        payerPointsBalance[transaction.payer] -= pointsToSpend
        pointsToSpend -= transaction.points - leftoverPoints
      }
    }

    let responseArr = []
    // populate the response array with the spent transactions
    for (const payer in spentTransactions) {
      responseArr.push({ payer, points: spentTransactions[payer] })
    }

    // return the response array of spent transations
    res.json(responseArr)
  } else {
    res.status(422).json(errorMsg)
  }
})

// return all payer point balances
app.get('/balance', (req, res) => {
  res.json(payerPointsBalance)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
