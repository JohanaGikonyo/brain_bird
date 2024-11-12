import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "./menu";

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} >
      <List>
        <Menu open={open} />
      </List>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>
        <div className="hover:text-slate-800 text-slate-400 hover:bg-gray-400 ">
          <MenuIcon />
        </div>
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)} PaperProps={{ sx: { backgroundColor: "rgb(15 23 42)",  borderRadius: '8px',  marginTop: '20px',  padding: '10px', }, }} >
        {DrawerList}
      </Drawer>
    </div>
  );
}
