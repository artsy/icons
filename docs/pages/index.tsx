import type { NextPage } from "next";
import Head from "next/head";
import * as Icons from "@artsy/icons/allIcons";
import {
  Box,
  Column,
  GridColumns,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Toasts,
} from "@artsy/palette";
import { ChangeEvent, useState } from "react";
import { Item } from "../components/Item";

const Home: NextPage = () => {
  const [icons, setIcons] = useState(Icons.ICONS);
  const [clipboardScheme, setClipboardScheme] = useState<"native" | "svg">(
    "svg"
  );

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (value === "") {
      setIcons(Icons.ICONS);
      return;
    }

    setIcons(() =>
      Icons.ICONS.filter(({ fileName }) =>
        fileName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <>
      <Head>
        <title>@artsy/icons</title>
        <meta name="description" content="@artsy/icons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toasts
        position="fixed"
        bottom={1}
        right={1}
        width={["75%", "50%", "33%"]}
        zIndex={1}
      />

      <Box as="main" m={4} pb={12}>
        <Box width={["100%", "50%"]} mx="auto">
          <Input placeholder="Search" onChange={handleChange} autoFocus />
        </Box>

        <Box width={["100%", "50%"]} mx="auto" mt={6}>
          <RadioGroup
            defaultValue="svg"
            onSelect={(value) => setClipboardScheme(value as "native" | "svg")}
            display="flex"
            justifyContent="center"
            flexDirection={["column", "row"]}
          >
            <Radio value="svg">SVG</Radio>
            <Spacer my={[1, 0]} mx={[0, 1]} />
            <Radio value="native">Native</Radio>
          </RadioGroup>
        </Box>

        <Spacer mt={6} />

        <GridColumns>
          {icons.map((icon) => {
            return (
              // @ts-ignore
              <Column span={[6, 4, 2]} key={icon.componentName}>
                <Item icon={icon} clipboardScheme={clipboardScheme} />
              </Column>
            );
          })}
        </GridColumns>
      </Box>
    </>
  );
};

export default Home;
