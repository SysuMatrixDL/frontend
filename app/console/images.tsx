import { Table, TableData } from '@mantine/core';

export default function Images () {
  var tableData: TableData = {
    caption: 'Some elements from periodic table',
    head: ['Element position', 'Atomic mass', 'Symbol', 'Element name'],
    body: [
      [6312, 12.011, 'C', 'Cafasfklkkprbon'],
      [723123, 14.007, 'N', 'Nijashpdjtrogen'],
      [32319, 88.906, 'Y', 'Yttrigasfum'],
      [531236, 137.33, 'Ba', 'Baragsfpium'],
      [5123138, 140.12, 'Ce', 'Ceriasdasfum'],
    ],
  };

  return (
    <Table data={tableData} />
  );
}