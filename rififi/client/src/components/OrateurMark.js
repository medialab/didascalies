import React from 'react';

const Mark = ({
  values : inputValues,
  name,
  colors,
  onHover,
  id,
}) => {
  // as we re represent squares and the mapped variable is surface
  // we apply a square root to squares dimensions
  const values = Object.keys(inputValues).reduce((res, key) => ({
    ...res,
    [key]: {
      relative: Math.sqrt(inputValues[key].relative),
      absolute: inputValues[key].absolute
    }
  }), {});
  const onMouseOver = () => {
    if (onHover) {
      onHover(id);
    }
  }
  return (
    <g>
      <ellipse
        cx={1}
        cy={1}
        rx={1}
        ry={1}
        stroke={'rgba(0,0,0,0.5)'}
        strokeWidth={'0.005'}
        fill={'transparent'}
        data-tip={`${name}`}
        data-for="mark"
        onMouseOver={onMouseOver}
      />
      <title>
        {`${name}`}
      </title>
      <rect
        x={1 - values['attaques_recues'].relative}
        y={1 - values['attaques_recues'].relative}
        width={values['attaques_recues'].relative}
        height={values['attaques_recues'].relative}
        fill={colors['negatif']}
        data-tip={`${name} - score d'attaques subies: ${values['attaques_recues'].absolute}`}
        data-for="mark"
        onMouseOver={onMouseOver}
      />
      <rect
        x={1}
        y={1 - values['mots_prononces'].relative}
        width={values['mots_prononces'].relative}
        height={values['mots_prononces'].relative}
        fill={colors['intervention']}
        data-tip={`${name} - ${values['mots_prononces'].absolute} mots prononcés`}
        data-for="mark"
        onMouseOver={onMouseOver}
      />
      <rect
        x={1}
        y={1}
        width={values['invectivite'].relative}
        height={values['invectivite'].relative}
        fill={colors['invective']}
        data-tip={`${name} - nombre d'interventions invectives : ${values['invectivite'].absolute}`}
        data-for="mark"
        onMouseOver={onMouseOver}
      />
      <rect
        x={1 - values['soutiens_recus'].relative}
        y={1}
        width={values['soutiens_recus'].relative}
        height={values['soutiens_recus'].relative}
        fill={colors['positif']}
        data-tip={`${name} - score de soutiens reçus: ${values['soutiens_recus'].absolute}`}
        data-for="mark"
        onMouseOver={onMouseOver}
      />
    </g>
  )
}

export default Mark;