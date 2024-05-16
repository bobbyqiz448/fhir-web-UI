import React from 'react';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { get } from 'lodash';
import { FhirCodesTooltips, getCodeableConcepts } from '../../../helpers/utils';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import type { TFunction } from '@opensrp/i18n';

export const parseCondition = (obj: ICondition) => {
  return {
    condition: getCodeableConcepts(get(obj, 'code')),
    severity: getCodeableConcepts(get(obj, 'severity')),
    verificationStatus: getCodeableConcepts(get(obj, 'verificationStatus')),
    category: getCodeableConcepts(get(obj, 'category')),
    clinicalStatus: getCodeableConcepts(get(obj, 'clinicalStatus')),
    recordedDate: get(obj, 'recordedDate'),
    onsetDateTime: get(obj, 'onsetDateTime'),
    id: get(obj, 'id'),
  };
};

export const parseConditionList = (list: ICondition[]) => {
  return list.map(parseCondition);
};

export type ConditionTableData = ReturnType<typeof parseCondition>;

export const columns = (t: TFunction) => [
  {
    title: t('Condition'),
    dataIndex: 'condition',
    render: (value: Coding[]) => {
      return <FhirCodesTooltips codings={value} />;
    },
  },
  {
    title: t('Severity'),
    dataIndex: 'severity',
    render: (value: Coding[]) => {
      return <FhirCodesTooltips codings={value} />;
    },
  },
  {
    title: t('Verification Status'),
    dataIndex: 'verificationStatus',
    render: (value: Coding[]) => {
      return <FhirCodesTooltips codings={value} />;
    },
  },
];

export const conditionSideViewData = (resoure: ICondition, t: TFunction) => {
  const {
    id,
    condition,
    verificationStatus,
    category,
    recordedDate,
    clinicalStatus,
    onsetDateTime,
  } = parseCondition(resoure);
  const headerLeftData = {
    [t('ID')]: id,
  };
  const bodyData = {
    [t('Category')]: <FhirCodesTooltips codings={category} />,
    [t('Created at')]: recordedDate,
    [t('Started at')]: onsetDateTime,
    [t('Clinical status')]: <FhirCodesTooltips codings={clinicalStatus} />,
  };
  return {
    title: <FhirCodesTooltips codings={condition} />,
    headerLeftData,
    bodyData,
    status: {
      title: (verificationStatus[0]?.display ?? verificationStatus[0]?.code) as string,
      color: 'green',
    },
  };
};
