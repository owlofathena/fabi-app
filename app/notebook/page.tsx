'use client'

import { useState, useReducer } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { TextareaAutosize } from '@mui/base';
import { Add, PlayArrow, Delete } from '@mui/icons-material';
// import { notebookReducer, initialState, TextBox, State, Action } from '../lib/notebookReducer';

interface TextBox {
  text: string;
  id: number;
  wordCount: number;
  runResult: string;
  isLoading: boolean;
}

const Notebook: React.FC = () => {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addTextBox = () => {
    setTextBoxes((prev) => [
      ...prev,
      { text: '', id: Date.now(), wordCount: 0, runResult: '', isLoading: false },
    ]);
    setSelectedIndex(textBoxes.length);
  };

  const deleteTextBox = (index: number) => {
    setTextBoxes((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  };

  const handleTextChange = async (index: number, text: string) => {
    setTextBoxes((prev) => {
      const newTextBoxes = [...prev];
      newTextBoxes[index] = { ...newTextBoxes[index], text };
      return newTextBoxes;
    });

    // Call the /stats endpoint to get the word count
    try {
      const response = await axios.post('http://localhost:5000/stats', { text });
      setTextBoxes((prev) => {
        const newTextBoxes = [...prev];
        newTextBoxes[index] = { ...newTextBoxes[index], wordCount: response.data.word_count };
        return newTextBoxes;
      });
    } catch (error) {
      console.error('Error fetching word count:', error);
    }
  };

  const runTextBox = async () => {
    if (selectedIndex === null) return;

    setTextBoxes((prev) => {
      const newTextBoxes = [...prev];
      newTextBoxes[selectedIndex] = { ...newTextBoxes[selectedIndex], isLoading: true };
      return newTextBoxes;
    });

    // Call the /run endpoint
    try {
      const response = await axios.post('http://localhost:5000/run', { text: textBoxes[selectedIndex].text });
      setTextBoxes((prev) => {
        const newTextBoxes = [...prev];
        newTextBoxes[selectedIndex] = { ...newTextBoxes[selectedIndex], runResult: response.data.result, isLoading: false };
        return newTextBoxes;
      });
    } catch (error) {
      setTextBoxes((prev) => {
        const newTextBoxes = [...prev];
        newTextBoxes[selectedIndex] = { ...newTextBoxes[selectedIndex], runResult: 'Error running the text.', isLoading: false };
        return newTextBoxes;
      });
    }
  };

  return (
    <Container>
      <Box my={2} display="flex" alignItems="center">
        <Tooltip title="Add Cell">
          <IconButton color="primary" onClick={addTextBox}>
            <Add />
          </IconButton>
        </Tooltip>
        {textBoxes.length > 0 && selectedIndex !== null && textBoxes[selectedIndex]?.text.trim() !== '' && (
          <Tooltip title="Run Cell">
            <span>
              <IconButton
                color="secondary"
                onClick={runTextBox}
                disabled={textBoxes[selectedIndex]?.isLoading}
              >
                {textBoxes[selectedIndex]?.isLoading ? <CircularProgress size={24} /> : <PlayArrow />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      <Grid container spacing={2}>
        {textBoxes.map((box, index) => (
          <Grid item xs={12} key={box.id}>
            <Card
              onClick={() => setSelectedIndex(index)}
              style={{ border: selectedIndex === index ? '2px solid blue' : 'none' }}
            >
              <CardContent>
                <TextareaAutosize
                  value={box.text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder="Edit text"
                  style={{ width: '100%', minHeight: '100px', border: '1px solid #ccc', padding: '8px' }}
                />
                <Box mt={1}>
                  <Typography variant="caption">Word count: {box.wordCount}</Typography>
                </Box>
                {box.runResult && (
                  <Box mt={2}>
                    <Typography variant="body2">Result: {box.runResult}</Typography>
                  </Box>
                )}
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Tooltip title="Delete Cell">
                    <span>
                      <IconButton color="error" onClick={() => deleteTextBox(index)} disabled={box.isLoading}>
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};


export default Notebook;