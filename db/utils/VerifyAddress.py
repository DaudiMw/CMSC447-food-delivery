from api.schemas.base_schema import Address
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

def verify_address(address: Address) -> bool:

    # First we will need to convert the given address into coordinates

    # Create geolocator instance.
    geolocator = Nominatim(user_agent="my_geocoder_app")

    input_address = f"{address.building}, {address.street}, {address.zip}, {address.state}, USA"

    input_location = geolocator.geocode(input_address, timeout=10, exactly_one=True)

    if not input_location:
        raise Exception("Invalid Input address or request timed out")

    # Now we will encode our address (UMBC)
    umbc_latitude = "39.255730"

    umbc_longitude = "-76.711154"

    if not umbc_longitude and not umbc_latitude:
        raise Exception("Invalid UMBC address or request timed out")

    # Calculate distance using geodesic (accounts for Earth's curvature)
    distance = geodesic(
        (input_location.latitude, input_location.longitude),
        (umbc_latitude, umbc_longitude)
    ).kilometers


    # UMBC website says the campus is 500 acres which is around 2 kilometers. https://umbc.edu/about/facts-and-figures/
    # So we will base the valid distances based on that, adding .5 to be safe.

    valid_dist = 1

    if distance > valid_dist:
        return False
    
    return True

