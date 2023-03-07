import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { DialogActions, DialogContent } from '@mui/material';

export interface SimpleDialogProps {
    open: boolean;
    items: Array<string>;
    title: string;
    onClose: () => void;
}

export function AbiDialog(props: SimpleDialogProps) {
    const { open, items, title, onClose } = props;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <List sx={{ pt: 0 }}>
                    {items.map((item) => (
                        <ListItem >
                            <ListItemText primary={item} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{margin: '0 auto'}}>
                <Button variant="outlined" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}