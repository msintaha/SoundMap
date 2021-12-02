import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


export default function BasicMenu({ name, items, onItemClick }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleItemClick = (item) => {
        onItemClick(item);
        handleClose();
    };
  
    return items.length ? (
      <div>
        <Button
          className="sm-Header-button"
          aria-expanded={open ? 'true' : undefined}
          variant="outlined"
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
        >
          {name}
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {items.map(item => <MenuItem key={item} onClick={() => handleItemClick(item)}>{item}</MenuItem>)}
        </Menu>
      </div>
    ) : null;
}