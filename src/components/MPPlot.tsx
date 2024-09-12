import Plot from 'react-plotly.js';

import { data } from "../data"
import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Container, CssBaseline, Divider, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Paper, Select, Typography } from '@mui/material';
import { btnBox, LinearProgressWithLabel, MessageBox, styleMainColBox } from './CommonComponents';
import { collection, CollectionReference, doc, DocumentReference, onSnapshot, or, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { df_row, ShapeType } from '../utils/dataInterfaces';
import { clear } from 'console';

export default function MarketProfilePlot() {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)

    const [stockList, setStockList] = useState<{ [key: string]: { [key: string]: number } } | undefined>(undefined)
    const [selectedStock, setSelectedStock] = useState<string | undefined>(undefined)
    const [monthList, setMonthList] = useState<{ [key: string]: number } | undefined>(undefined)
    const [targetMonth, setTargetMonth] = useState<string | undefined>(undefined)
    const [mpStack, setMpstack] = useState<df_row[] | undefined>(undefined)
    const [cardNumber, setCardNumber] = useState<number>(0)
    const [plotData, setPlotData] = useState<{ 'x_values': number[], 'y_values': number[], 'color_values': string[] } | undefined>(undefined)
    const [selectedShape, setSelectedShape] = useState<ShapeType | undefined>(undefined)
    const monthLogDocRef: DocumentReference = doc(db, '/market_profile/equity')

    function handleNext() {
        if (cardNumber < mpStack!.length - 1) {
            setCardNumber(cardNumber + 1)
        } else {
            const currentMonthIndex = Object.keys(monthList!).indexOf(targetMonth!)
            if (currentMonthIndex < monthList!.length - 1) {
                setTargetMonth(Object.keys(monthList!)[currentMonthIndex + 1])
            } else {
                const selectedStockIndex = Object.keys(stockList!).indexOf(selectedStock!)
                if (selectedStockIndex < Object.keys(stockList!).length - 1) {
                    setInfoMessage(`No more trade date in ${targetMonth} for ${selectedStock}.`)
                    setSelectedStock(Object.keys(stockList!)[selectedStockIndex + 1])
                } else {
                    setInfoMessage('End of the stock list')
                }
            }
        }
    }

    function handleShapeChange() {
        if (!selectedShape || !stockList || !selectedStock || !targetMonth) return
        const mpDocRef: DocumentReference = doc(db, `/market_profile/equity/${selectedStock}/${mpStack![cardNumber].trade_date}`)

        // calculate shape != ''
        let completionCount = 0
        for (var mpCard of mpStack!) {
            (['b', 'p', 'n', 'double', 'box', 'undefined_shape'].includes(mpCard.shape)) && completionCount++

            console.log('date: ', mpCard.trade_date, 'shape: ', mpCard.shape, 'count: ', completionCount);
        }
        console.log('completion count: ', completionCount);

        const completionRatio = (completionCount + 1) / mpStack!.length
        console.log('completion ratio: ', completionRatio);

        if (completionRatio > 1) {
            // update the corresponding shape of the trade date only
            updateDoc(mpDocRef, { shape: selectedShape }).then(() => {
                setCardNumber(cardNumber + 1)
                console.log('shape updated')
            }).catch((error) => {
                console.log(error)
            })
        } else {
            // update the shape of the trade date and month log
            let monthLog = { ...stockList }
            monthLog[selectedStock][targetMonth] = completionRatio
            updateDoc(mpDocRef, { shape: selectedShape }).then(() => {
                console.log('shape updated')
                setCardNumber(cardNumber + 1)
            }).catch((error) => {
                console.log(error)
            })
            updateDoc(monthLogDocRef, monthLog).then(() => {
                console.log('month log updated')
                console.log(monthLog)
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    useEffect(() => {
        setPlotData(undefined)
        if (!mpStack) return
        const mpCard = mpStack[cardNumber]
        const y_values = Object.keys(mpCard.tpo_count).map(Number)
        const x_values = Object.values(mpCard.tpo_count)
        const color_values = []
        for (var y of y_values) {
            if (mpCard.pocs.includes(y)) {
                color_values.push('red')
            } else if (y >= mpCard.val && y <= mpCard.vah) {
                color_values.push('green')
            } else if (y <= mpCard.spkl || y >= mpCard.spkh) {
                color_values.push('yellow')
            } else {
                color_values.push('blue')
            }
        }
        setPlotData({ 'x_values': x_values, 'y_values': y_values, 'color_values': color_values })
    }, [mpStack, cardNumber])

    // get data from fire store
    useEffect(() => {
        setMpstack(undefined)
        if (!selectedStock || !targetMonth) return
        const tradeDateRange: string[] = []
        const stockColRef: CollectionReference = collection(db, '/market_profile/equity', selectedStock)
        const q = query(stockColRef, where('trade_month', '==', targetMonth))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: df_row[] = []
            snapshot.forEach((tradeDateDoc) => {
                data.push(tradeDateDoc.data() as df_row)
            })
            setMpstack(data)
            setCardNumber(0)
            setSelectedShape(undefined)
        })
        return unsubscribe
    }, [targetMonth])

    useEffect(() => {
        setMonthList(undefined)
        if (!selectedStock || !stockList) return
        const sortedMonths = Object.entries(stockList[selectedStock]).sort(([a,], [b,]) => Number(b.replace('-', '')) - Number(a.replace('-', '')))
        setMonthList(Object.fromEntries(sortedMonths))
        setTargetMonth(sortedMonths[0][0])
    }, [selectedStock])

    useEffect(() => {
        setSelectedStock(undefined)
        stockList && setSelectedStock(Object.keys(stockList)[0])
    }, [stockList])

    // getstock list from database
    useEffect(() => {
        const unsubscribe_sl = onSnapshot(monthLogDocRef, (stocklistDoc) => {
            setStockList(undefined)
            setSelectedStock(undefined)
            if (stocklistDoc.exists()) {
                setStockList(stocklistDoc.data())

            }
        })
        return unsubscribe_sl
    }, [])

    return (
        <Container component='main' maxWidth="md" sx={{ mt: 4, width: { md: `calc(100% - 250px)` } }}>
            <Box sx={styleMainColBox} >
                {/* plot area */}
                <Grid container>
                    <Grid item xs={6} my={2}>
                        {stockList && selectedStock && <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Pick a stock</InputLabel>
                            <Select
                                value={selectedStock}
                                label="Pick a stock"
                                onChange={(e) => setSelectedStock(e.target.value as string)}
                            >
                                {Object.keys(stockList).map((stock) => <MenuItem value={stock} key={stock}>{stock}</MenuItem>)}
                            </Select>
                        </FormControl>}
                    </Grid>
                    <Grid item xs={6} my={2}>
                        {monthList && targetMonth && <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Pick a month</InputLabel>
                            <Select
                                value={targetMonth}
                                label="Pick a month"
                                onChange={(e) => setTargetMonth(e.target.value as string)}
                            >
                                {Object.keys(monthList).map((month) => <MenuItem value={month} key={month}>{month} ~ {(monthList[month] * 100).toFixed(0)}%</MenuItem>)}
                            </Select>
                        </FormControl>}
                    </Grid>
                    {plotData && targetMonth && monthList && mpStack &&
                        <Grid item xs={12}>
                            <LinearProgressWithLabel value={monthList[targetMonth] * 100} />
                            <Paper elevation={6} sx={{ borderRadius: 4, width: '100%', height: '200' }} >
                                <Plot
                                    data={[{
                                        x: plotData.x_values,
                                        y: plotData.y_values,
                                        type: 'bar',
                                        orientation: 'h',
                                        mode: 'lines+markers',
                                        marker: { color: plotData.color_values },
                                    }]}
                                    layout={{
                                        title: `MP Shape ${mpStack[cardNumber].trade_date}: ${mpStack[cardNumber].shape}`,
                                        margin: { l: 50, r: 25, t: 50, b: 25 },
                                        dragmode: false
                                        // paper_bgcolor: '#f0f0f0',
                                        // plot_bgcolor: '#ffffff', 
                                    }}
                                    useResizeHandler={true}
                                    style={{ width: "100%", height: "100%" }}
                                    config={{ displayModeBar: false }}
                                />
                            </Paper>
                        </Grid>
                    }

                    <Grid item xs={12} md={6}>
                        <Box sx={btnBox}>
                        <Button variant="contained" onClick={() => setSelectedShape('undefined_shape')}> undefined </Button>
                        <Button variant="contained" onClick={() => setSelectedShape('box')}> Box </Button>
                            <Button variant="contained" onClick={() => setSelectedShape('double')}> Double </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={btnBox}>
                            <Button variant="contained" onClick={() => setSelectedShape('b')}> b </Button>
                            <Button variant="contained" onClick={() => setSelectedShape('p')}> p </Button>
                            <Button variant="contained" onClick={() => setSelectedShape('n')}> n </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography component="h6" variant="h6">
                            Change shape label to: <b>{selectedShape && '~ ' + selectedShape + ' ~'}</b>
                        </Typography>
                        <Divider></Divider>
                        <Box sx={btnBox}>
                            <Button variant="contained" onClick={() => handleNext()}> Skip </Button>
                            <Button variant="contained" onClick={handleShapeChange} disabled={!selectedShape}> confirm </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => setInfoMessage(undefined)} type='info' message={infoMessage} />}
            {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='error' message={errorMessage} />}
            {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='success' message={successMessage} />}

        </Container>

    );
}

