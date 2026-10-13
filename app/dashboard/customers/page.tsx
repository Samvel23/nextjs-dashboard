import { Box, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import Search from "@/app/ui/search";
import { fetchFilteredCustomers } from "@/app/lib/data";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query ?? "";
  const customers = await fetchFilteredCustomers(query);

  return (
    <Flex direction="column" gap="6">
      <Box>
        <Heading size="xl">Customers</Heading>
        <Text color="fg.muted" mt="2">
          Browse customers and their invoice totals.
        </Text>
      </Box>

      <Search placeholder="Search customers..." />

      {customers.length === 0 ? (
        <Text color="fg.muted">No customers found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="4">
          {customers.map((customer) => {
            const initials = customer.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <Box
                key={customer.id}
                borderWidth="1px"
                borderColor="border"
                bg="bg.panel"
                p="5"
                rounded="lg"
              >
                <Flex align="center" gap="3">
                  <Flex
                    align="center"
                    justify="center"
                    boxSize="11"
                    rounded="full"
                    bg="blue.100"
                    color="blue.800"
                    fontWeight="semibold"
                  >
                    {initials}
                  </Flex>
                  <Box minW="0">
                    <Heading size="sm" truncate>
                      {customer.name}
                    </Heading>
                    <Text color="fg.muted" fontSize="sm" truncate>
                      {customer.email}
                    </Text>
                  </Box>
                </Flex>

                <SimpleGrid columns={3} gap="3" mt="5">
                  <Box>
                    <Text color="fg.muted" fontSize="xs">
                      Invoices
                    </Text>
                    <Text fontWeight="semibold">{customer.total_invoices}</Text>
                  </Box>
                  <Box>
                    <Text color="fg.muted" fontSize="xs">
                      Pending
                    </Text>
                    <Text fontWeight="semibold">{customer.total_pending}</Text>
                  </Box>
                  <Box>
                    <Text color="fg.muted" fontSize="xs">
                      Paid
                    </Text>
                    <Text fontWeight="semibold">{customer.total_paid}</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Flex>
  );
}
