import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

export type SimpleDialogProps = {
    title: string
    text: string
    open: boolean;
    onClose: () => void;
}

export function SimpleDialog({title,text,open,onClose}: SimpleDialogProps) {
    

    return (
        <Dialog
        open={open}
        onClose={() => {}}
      >
        <DialogTitle id="alert-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{overflowWrap: 'break-word'}} id="alert-dialog-description">
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    )
}