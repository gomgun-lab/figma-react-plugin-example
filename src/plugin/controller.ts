figma.showUI(__html__);

figma.on("run", async () => {
  // const selection = figma.currentPage.selection;

  // if (selection.length === 1 && selection[0].type === "FRAME") {
  //   const selectedFrame = selection[0];

  //   const name = selectedFrame.name;

  //   figma.ui.postMessage({ type: "frameSelected", data: name });
  // } else {
  //   figma.ui.postMessage({
  //     type: "noFrameSelected",
  //     data: "프레임을 선택해주세요.",
  //   });
  // }

  // figma.notify("hello world");

  await extractTokens();
});

type TokenValue = {
  $type: VariableResolvedDataType;
  $value: VariableValue;
};

interface TokenFile {
  fileName: string;
  body: TokenBody;
}

interface TokenBody {
  [key: string]: TokenBody | TokenValue;
}

async function extractTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const files = [];
  for (const collection of collections) {
    files.push(...(await processCollection(collection)));
  }

  console.log(files);
}

async function processCollection({
  name,
  modes,
  variableIds,
}: VariableCollection) {
  const files: TokenFile[] = [];

  for (const mode of modes) {
    const file: TokenFile = {
      fileName:
        modes.length === 1
          ? `${name}.tokens.json`
          : `${name}.${mode.name}.tokens.json`,
      body: {},
    };

    for (const variableId of variableIds) {
      const { name, resolvedType, valuesByMode } =
        await figma.variables.getVariableByIdAsync(variableId);
      const value = valuesByMode[mode.modeId];

      file.body[replacesSlashWithDot(name)] = {
        ...(await createTokenValue(resolvedType, value)),
      };
    }

    files.push(file);
  }

  return files;
}

async function createTokenValue(
  resolvedType: VariableResolvedDataType,
  value: VariableValue
): Promise<TokenValue | null> {
  switch (resolvedType) {
    case "BOOLEAN":
    case "STRING":
    case "COLOR":
      if (isRGBA(value)) {
        return { $type: "COLOR", $value: rgbToHex(value) };
      }
      break;
    case "FLOAT":
      if (typeof value === "number") {
        return { $type: "FLOAT", $value: value };
      }
      break;
    default:
      console.warn(`Unsupported type: ${resolvedType}`);
  }

  if (isVariableAlias(value)) {
    const { name } = await figma.variables.getVariableByIdAsync(value.id);
    return { $type: resolvedType, $value: `{${replacesSlashWithDot(name)}}` };
  }

  return null;
}

function isRGBA(value: any): value is RGBA {
  return (
    typeof value === "object" &&
    "r" in value &&
    "g" in value &&
    "b" in value &&
    "a" in value
  );
}

function isVariableAlias(value: any): value is VariableAlias {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS" &&
    "id" in value
  );
}

function rgbToHex({ r, g, b, a }: RGBA): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");

  if (a !== 1) {
    const alpha = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${hex}${alpha}`;
  }

  return `#${hex}`;
}

function replacesSlashWithDot(inputString: string) {
  return inputString.replace(/\//g, ".");
}

function wrapWithBraces(inputString: string) {
  return "{" + inputString + "}";
}
