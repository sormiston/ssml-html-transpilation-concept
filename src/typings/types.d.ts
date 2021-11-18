type EditPoint = {
  tnode: Text;
  idx: number;
};
type CorrelationMapEntry = {
  tnode: Text;
  idx: number;
  c: string;
  masterIdx: number;
  note?: string;
};
type CorrelationMap = Array<CorrelationMapEntry>;
type OrganizedCorrelationMap = {
  [index: string]: CorrelationMap;
};
type CorrelationEngineData = {
  correlationMap: CorrelationMap;
  selectableTextIdx: number | null;
};
type RangeMap = {
  [index: string]: Text;
};
type Partition = {
  partitionKey: string;
  partitionStart: number;
  partitionEnd: number;
  isFinal?: boolean;
};

type FlaggedForSplice = HTMLElement & { replaceMeWith: HTMLElement };

// what SSMLWorkDiv should report on hover
interface hoverSSMLSummary {
  marks: Array<[DOMRect]>;
}
interface SSMLTag {
  tagType: string;
  elt: HTMLSpanElement;
}
interface ProsodyTag extends SSMLTag {
  tagType: "prosody";
  attributes: {
    pitch?: string;
    contour?: string;
    range?: string;
    rate?: string;
    duration?: string;
    volume?: string;
  };
}
interface LocalParamBundle {
  elt: HTMLSpanElement;
  params: Array<
    | RateInformation
    | VolumeInformation
    | PitchInformation
    | IntonationInformation
    | PronunciationInformation
  >;
}

interface RateInformation {
  param: "rate";
  rate: string;
}

interface VolumeInformation {
  param: "volume";
  volume: string;
}
interface PitchInformation {
  param: "pitch";
  pitch: string;
}
interface IntonationInformation {
  param: "intonation";
  intonation: string;
}

interface PronunciationInformation {
  // TO DO
}
