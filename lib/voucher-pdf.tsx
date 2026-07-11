import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 22, marginBottom: 8, fontWeight: 700 },
  line: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  section: { marginTop: 18 },
  label: { color: "#555" },
});

export type VoucherData = {
  bookingId: string;
  packageTitle: string;
  vendorName: string;
  pickupCity: string;
  tier: string;
  travelDate: string;
  travelers: string[];
  pickupFare: number;
  stayAndExtras: number;
  localTransport: number;
  total: number;
};

function formatPKR(value: number) {
  return "PKR " + value.toLocaleString("en-PK");
}

export function VoucherDocument({ data }: { data: VoucherData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Ghoomora e-Voucher</Text>
        <Text>Booking {data.bookingId}</Text>
        <Text>{data.packageTitle}</Text>
        <Text>Operator: {data.vendorName}</Text>
        <View style={styles.section}>
          <Text>Tier: {data.tier}</Text>
          <Text>Pickup: {data.pickupCity}</Text>
          <Text>Departure: {data.travelDate}</Text>
          <Text>Travelers: {data.travelers.join(", ")}</Text>
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8 }}>Itemized charges</Text>
          <View style={styles.line}><Text style={styles.label}>Pickup transport</Text><Text>{formatPKR(data.pickupFare)}</Text></View>
          <View style={styles.line}><Text style={styles.label}>Stay & tier inclusions</Text><Text>{formatPKR(data.stayAndExtras)}</Text></View>
          {data.localTransport > 0 && <View style={styles.line}><Text style={styles.label}>Local 4x4 day-hire</Text><Text>{formatPKR(data.localTransport)}</Text></View>}
          <View style={styles.line}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{formatPKR(data.total)}</Text></View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderVoucherPdf(data: VoucherData) {
  return renderToBuffer(<VoucherDocument data={data} />);
}
