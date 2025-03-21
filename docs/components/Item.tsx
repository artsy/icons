import styled from "styled-components";
import { Clickable, Spacer, Text, useToasts } from "@artsy/palette";
import { FC } from "react";
import { ICONS } from "@artsy/icons/allIcons";
import * as Icons from "@artsy/icons/allIcons";
import themeGet from "@styled-system/theme-get";

interface ItemProps {
  icon: (typeof ICONS)[number];
  clipboardScheme: "native" | "svg";
}

type IconComponent = Exclude<typeof Icons[keyof typeof Icons], typeof ICONS>;

export const Item: FC<ItemProps> = ({ icon, clipboardScheme }) => {
  const { sendToast } = useToasts();

  const handleClick = () => {
    const importStatement =
      clipboardScheme === "native"
        ? `import { ${icon.componentName} } from "@artsy/icons/native";`
        : `import ${icon.componentName} from "@artsy/icons/${icon.fileName}";`;

    navigator?.clipboard.writeText(importStatement);

    sendToast({
      message: `Import for ${icon.componentName} copied to clipboard`,
      variant: "success",
    });
  };

  const Icon = Icons[icon.componentName as keyof typeof Icons] as IconComponent;

  return (
    <Container
      textAlign="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mx="auto"
      height="100%"
      width="100%"
      p={1}
      borderRadius={3}
      onClick={handleClick}
    >
      <Icon m="auto" />

      <Spacer mt={1} />

      <Text variant="xs">
        {icon.componentName}
        <br />
        {icon.width}×{icon.height}
      </Text>
    </Container>
  );
};

const Container = styled(Clickable)`
  transition: background-color 250ms, color 250ms;

  ${Text} {
    color: ${themeGet("colors.black60")};
    transition: color 250ms;
  }

  &:hover {
    color: ${themeGet("colors.blue100")};
    background-color: ${themeGet("colors.black5")};

    ${Text} {
      color: ${themeGet("colors.blue100")};
    }
  }
`;
