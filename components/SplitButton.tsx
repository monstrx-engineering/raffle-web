import { ActionIcon, createStyles, Group, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons";
import React from "react";

const useStyles = createStyles((theme) => ({
  button: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },

  menuControl: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 0,
    borderLeft: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white}`
  }
}));

export function SplitButton({ button: Button, children: dropdown }) {
  const { classes, theme } = useStyles();
  // const menuIconColor = theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 6];

  return (
    <Group noWrap spacing={0}>
      {React.cloneElement(Button, { className: classes.button })}
      <Menu transition="pop" position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="filled"
            color={Button.props.color || theme.primaryColor}
            size={36}
            className={classes.menuControl}
            h={50}
          >
            <IconChevronDown size={16} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        {dropdown}
      </Menu>
    </Group>
  );
}
