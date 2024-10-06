import { Pagination } from '@shopify/polaris';

function CustomPagination({ currentPage, totalPages, onNext, onPrevious }) {
  return (
    <Pagination
      hasPrevious={currentPage > 1}
      onPrevious={onPrevious}
      hasNext={currentPage < totalPages}
      onNext={onNext}
    />
  );
}

export default CustomPagination;
