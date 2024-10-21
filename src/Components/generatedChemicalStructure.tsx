import React from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Text, Path } from "react-native-svg";

interface Atom {
  element: string;
  bonds: number;
  bondedTo: Atom[];
  x?: number;
  y?: number;
  charge?: number;
  lonePairs?: number;
}

interface Bond {
  atom1: Atom;
  atom2: Atom;
  bondType: 'single' | 'double' | 'triple' | 'aromatic';
}

// Add more precise electronegativity values and expand the bondingRules
const bondingRules: { [key: string]: { valence: number, electronegativity: number, radius: number } } = {
  H: { valence: 1, electronegativity: 2.20, radius: 25 },
  C: { valence: 4, electronegativity: 2.55, radius: 40 },
  N: { valence: 3, electronegativity: 3.04, radius: 35 },
  O: { valence: 2, electronegativity: 3.44, radius: 30 },
  F: { valence: 1, electronegativity: 3.98, radius: 28 },
  Cl: { valence: 1, electronegativity: 3.16, radius: 45 },
  Br: { valence: 1, electronegativity: 2.96, radius: 50 },
  I: { valence: 1, electronegativity: 2.66, radius: 55 },
  S: { valence: 6, electronegativity: 2.58, radius: 50 },
  P: { valence: 5, electronegativity: 2.19, radius: 45 },
  Si: { valence: 4, electronegativity: 1.90, radius: 50 },
  B: { valence: 3, electronegativity: 2.04, radius: 35 },
  Al: { valence: 3, electronegativity: 1.61, radius: 45 },
};

const parseFormula = (formula: string): { [key: string]: number } => {
  const regex = /([A-Z][a-z]*)(\d*)|(\(([^)]+)\))(\d*)/g;
  let elements: { [key: string]: number } = {};
  let match;

  const addElement = (element: string, count: number) => {
    elements[element] = (elements[element] || 0) + count;
  };

  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) {
      let element = match[1];
      let count = match[2] ? parseInt(match[2]) : 1;
      addElement(element, count);
    } else if (match[3]) {
      let subFormula = match[4];
      let subCount = match[5] ? parseInt(match[5]) : 1;
      let subElements = parseFormula(subFormula);
      for (let element in subElements) {
        addElement(element, subElements[element] * subCount);
      }
    }
  }
  return elements;
};

const createAtoms = (elements: { [key: string]: number }): Atom[] => {
  let atoms: Atom[] = [];
  for (let element in elements) {
    let count = elements[element];
    for (let i = 0; i < count; i++) {
      atoms.push({
        element,
        bonds: bondingRules[element]?.valence || 0,
        bondedTo: [],
        charge: 0,
        lonePairs: calculateLonePairs(element)
      });
    }
  }
  return atoms;
};

const calculateLonePairs = (element: string): number => {
  const valence = bondingRules[element]?.valence || 0;
  const group = getGroupNumber(element);
  return Math.max(0, (group - valence) / 2);
};

const getGroupNumber = (element: string): number => {
  const valence = bondingRules[element]?.valence || 0;
  return valence <= 4 ? valence : 8 - valence;
};


const generateBonds = (atoms: Atom[]): Bond[] => {
  let bonds: Bond[] = [];
  let unbondedAtoms = [...atoms];

  while (unbondedAtoms.length > 1) {
    unbondedAtoms.sort((a, b) => b.bonds - a.bonds);
    let atom1 = unbondedAtoms[0];
    let bestMatch = { atom: unbondedAtoms[1], score: -Infinity };

    for (let i = 1; i < unbondedAtoms.length; i++) {
      let atom2 = unbondedAtoms[i];
      if (atom1.bonds > 0 && atom2.bonds > 0) {
        let score = calculateBondScore(atom1, atom2);
        if (score > bestMatch.score) {
          bestMatch = { atom: atom2, score };
        }
      }
    }

    if (bestMatch.score > -Infinity) {
      let bondType = determineBondType(atom1, bestMatch.atom);
      bonds.push({ atom1, atom2: bestMatch.atom, bondType });
      atom1.bondedTo.push(bestMatch.atom);
      bestMatch.atom.bondedTo.push(atom1);
      
      const bondStrength = getBondStrength(bondType);
      atom1.bonds -= bondStrength;
      bestMatch.atom.bonds -= bondStrength;

      if (atom1.bonds === 0) {
        unbondedAtoms.shift();
      }
      if (bestMatch.atom.bonds === 0) {
        unbondedAtoms.splice(unbondedAtoms.indexOf(bestMatch.atom), 1);
      }
    } else {
      unbondedAtoms.push(unbondedAtoms.shift()!);
    }
  }

  return bonds;
};

const calculateBondScore = (atom1: Atom, atom2: Atom): number => {
  const electronegativityDiff = Math.abs(
    bondingRules[atom1.element].electronegativity - bondingRules[atom2.element].electronegativity
  );
  const bondingCapacity = Math.min(atom1.bonds, atom2.bonds);
  return bondingCapacity - electronegativityDiff;
};

const determineBondType = (atom1: Atom, atom2: Atom): 'single' | 'double' | 'triple' | 'aromatic' => {
  const totalBonds = atom1.bonds + atom2.bonds;
  if (isAromaticPair(atom1, atom2)) return 'aromatic';
  if (totalBonds >= 6) return 'triple';
  if (totalBonds >= 4) return 'double';
  return 'single';
};

const isAromaticPair = (atom1: Atom, atom2: Atom): boolean => {
  const aromaticElements = ['C', 'N', 'O', 'S'];
  return aromaticElements.includes(atom1.element) && aromaticElements.includes(atom2.element);
};

const getBondStrength = (bondType: 'single' | 'double' | 'triple' | 'aromatic'): number => {
  switch (bondType) {
    case 'single': return 1;
    case 'double': return 2;
    case 'triple': return 3;
    case 'aromatic': return 1.5;
  }
};

const arrangeAtoms = (atoms: Atom[], bonds: Bond[]) => {
  const centerX = 200;
  const centerY = 200;
  const baseRadius = 100;

  const centralAtom = atoms.reduce((a, b) => a.bondedTo.length > b.bondedTo.length ? a : b);
  centralAtom.x = centerX;
  centralAtom.y = centerY;

  const arrangeConnectedAtoms = (atom: Atom, angle: number, depth: number) => {
    const connectedAtoms = atom.bondedTo.filter(a => a.x === undefined);
    const angleStep = (2 * Math.PI) / Math.max(connectedAtoms.length, 3);
    
    connectedAtoms.forEach((connectedAtom, index) => {
      const newAngle = angle + angleStep * (index + 1);
      const distance = baseRadius / (depth + 1) + bondingRules[connectedAtom.element].radius;
      connectedAtom.x = atom.x! + distance * Math.cos(newAngle);
      connectedAtom.y = atom.y! + distance * Math.sin(newAngle);
      arrangeConnectedAtoms(connectedAtom, newAngle, depth + 1);
    });
  };

  arrangeConnectedAtoms(centralAtom, 0, 0);

  const adjustPositions = () => {
    const repulsionForce = 5;
    atoms.forEach(atom1 => {
      atoms.forEach(atom2 => {
        if (atom1 !== atom2) {
          const dx = atom1.x! - atom2.x!;
          const dy = atom1.y! - atom2.y!;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = bondingRules[atom1.element].radius + bondingRules[atom2.element].radius;
          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const force = (minDistance - distance) / minDistance * repulsionForce;
            atom1.x! += force * Math.cos(angle);
            atom1.y! += force * Math.sin(angle);
            atom2.x! -= force * Math.cos(angle);
            atom2.y! -= force * Math.sin(angle);
          }
        }
      });
    });
  };

  for (let i = 0; i < 50; i++) {
    adjustPositions();
  }
};

export const generateChemicalStructure = (formula: string): Bond[] => {
  const elements = parseFormula(formula);
  const atoms = createAtoms(elements);
  const bonds = generateBonds(atoms);
  arrangeAtoms(atoms, bonds);
  return bonds;
};

interface ChemicalStructureProps {
  formula: string;
  width: number;
  height: number;
  onStructureGenerated?: (bonds: Bond[]) => void;
}

interface ChemicalStructureState {
  bonds: Bond[];
  elements: { [key: string]: number };
}

export class ChemicalStructure extends React.Component<ChemicalStructureProps, ChemicalStructureState> {
  constructor(props: ChemicalStructureProps) {
    super(props);
    this.state = {
      bonds: [],
      elements: parseFormula(props.formula),
    };
  }

  componentDidMount() {
    this.generateStructure();
  }

  componentDidUpdate(prevProps: ChemicalStructureProps) {
    if (prevProps.formula !== this.props.formula) {
      this.generateStructure();
    }
  }

  generateStructure() {
    const bonds = generateChemicalStructure(this.props.formula);
    this.setState({ bonds, elements: parseFormula(this.props.formula) });

    if (this.props.onStructureGenerated) {
      this.props.onStructureGenerated(bonds);
    }
  }

  render() {
    const { width, height } = this.props;
    const { bonds } = this.state;

    // Calculate the bounding box of the structure
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    bonds.forEach(bond => {
      [bond.atom1, bond.atom2].forEach(atom => {
        minX = Math.min(minX, atom.x!);
        minY = Math.min(minY, atom.y!);
        maxX = Math.max(maxX, atom.x!);
        maxY = Math.max(maxY, atom.y!);
      });
    });

    // Calculate scaling factor and offset
    const structureWidth = maxX - minX;
    const structureHeight = maxY - minY;
    const scale = Math.min(width / structureWidth, height / structureHeight) * 0.8;
    const offsetX = (width - structureWidth * scale) / 2;
    const offsetY = (height - structureHeight * scale) / 2;

    return (
      <View style={{ width, height }}>
        <Svg height={height} width={width}>
          {bonds.map((bond, index) => this.renderBond(bond, index, scale, offsetX, offsetY, minX, minY))}
          {bonds.flatMap(bond => [bond.atom1, bond.atom2]).map((atom, index) => 
            this.renderAtom(atom, index, scale, offsetX, offsetY, minX, minY)
          )}
        </Svg>
      </View>
    );
  }

  renderBond = (bond: Bond, index: number, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) => (
    <React.Fragment key={`bond-${index}`}>
      {this.renderBondLine(bond, scale, offsetX, offsetY, minX, minY)}
    </React.Fragment>
  );

  renderAtom = (atom: Atom, index: number, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) => (
    <React.Fragment key={`atom-${index}`}>
      {this.renderAtomCircle(atom, scale, offsetX, offsetY, minX, minY)}
      {this.renderAtomLabel(atom, scale, offsetX, offsetY, minX, minY)}
      {atom.charge !== 0 && this.renderCharge(atom, scale, offsetX, offsetY, minX, minY)}
      {atom.lonePairs! > 0 && this.renderLonePairs(atom, scale, offsetX, offsetY, minX, minY)}
    </React.Fragment>
  );

  renderBondLine(bond: Bond, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) {
    const { atom1, atom2, bondType } = bond;
    const x1 = (atom1.x! - minX) * scale + offsetX;
    const y1 = (atom1.y! - minY) * scale + offsetY;
    const x2 = (atom2.x! - minX) * scale + offsetX;
    const y2 = (atom2.y! - minY) * scale + offsetY;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perpendicularAngle = angle + Math.PI / 2;
    const offset = 2 * scale;

    switch (bondType) {
      case 'single':
        return <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={2} />;
      case 'double':
        return (
          <>
            <Line
              x1={x1 + offset * Math.cos(perpendicularAngle)}
              y1={y1 + offset * Math.sin(perpendicularAngle)}
              x2={x2 + offset * Math.cos(perpendicularAngle)}
              y2={y2 + offset * Math.sin(perpendicularAngle)}
              stroke="black"
              strokeWidth={1.5}
            />
            <Line
              x1={x1 - offset * Math.cos(perpendicularAngle)}
              y1={y1 - offset * Math.sin(perpendicularAngle)}
              x2={x2 - offset * Math.cos(perpendicularAngle)}
              y2={y2 - offset * Math.sin(perpendicularAngle)}
              stroke="black"
              strokeWidth={1.5}
            />
          </>
        );
      case 'triple':
        return (
          <>
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={1.5} />
            <Line
              x1={x1 + offset * Math.cos(perpendicularAngle)}
              y1={y1 + offset * Math.sin(perpendicularAngle)}
              x2={x2 + offset * Math.cos(perpendicularAngle)}
              y2={y2 + offset * Math.sin(perpendicularAngle)}
              stroke="black"
              strokeWidth={1.5}
            />
            <Line
              x1={x1 - offset * Math.cos(perpendicularAngle)}
              y1={y1 - offset * Math.sin(perpendicularAngle)}
              x2={x2 - offset * Math.cos(perpendicularAngle)}
              y2={y2 - offset * Math.sin(perpendicularAngle)}
              stroke="black"
              strokeWidth={1.5}
            />
          </>
        );
      case 'aromatic':
        return (
          <>
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={1.5} />
            <Path
              d={`M ${midX} ${midY} Q ${x2} ${y2} ${x2} ${y2}`}
              fill="none"
              stroke="black"
              strokeWidth={1}
            />
          </>
        );
    }
  }

  renderAtomCircle(atom: Atom, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) {
    const x = (atom.x! - minX) * scale + offsetX;
    const y = (atom.y! - minY) * scale + offsetY;
    return (
      <Circle
        cx={x}
        cy={y}
        r={10 * scale}
        stroke="black"
        strokeWidth={1}
        fill="lightblue"
      />
    );
  }

  renderAtomLabel(atom: Atom, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) {
    const x = (atom.x! - minX) * scale + offsetX;
    const y = (atom.y! - minY) * scale + offsetY;
    return (
      <Text
        x={x - 5 * scale}
        y={y + 5 * scale}
        fontSize={12 * scale}
        fill="black"
      >
        {atom.element}
      </Text>
    );
  }

  renderCharge(atom: Atom, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) {
    const x = (atom.x! - minX) * scale + offsetX;
    const y = (atom.y! - minY) * scale + offsetY;
    return (
      <Text
        x={x + 8 * scale}
        y={y - 8 * scale}
        fontSize={10 * scale}
        fill="red"
      >
        {atom.charge! > 0 ? `+${atom.charge}` : atom.charge}
      </Text>
    );
  }

  renderLonePairs(atom: Atom, scale: number, offsetX: number, offsetY: number, minX: number, minY: number) {
    const x = (atom.x! - minX) * scale + offsetX;
    const y = (atom.y! - minY) * scale + offsetY;
    const radius = 15 * scale;
    const angleStep = (2 * Math.PI) / atom.lonePairs!;
    return Array.from({ length: atom.lonePairs! }).map((_, index) => {
      const angle = index * angleStep;
      const lpX = x + radius * Math.cos(angle);
      const lpY = y + radius * Math.sin(angle);
      return (
        <Circle
          key={`lonepair-${index}`}
          cx={lpX}
          cy={lpY}
          r={2 * scale}
          fill="yellow"
          stroke="black"
          strokeWidth={0.5}
        />
      );
    });
  }
}

export default React.memo(ChemicalStructure);